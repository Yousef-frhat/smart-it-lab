/**
 * ios-engine.js — a lightweight, STATEFUL Cisco IOS CLI simulator.
 *
 * Unlike the legacy terminal-engine (which returns canned strings), this
 * engine maintains per-device state (CLI mode, hostname, interfaces, VLANs,
 * routing config) so a student can actually configure a device and SEE the
 * result reflected in `show` output and the prompt.
 *
 * Design goals:
 *  - Zero external dependencies, pure in-memory logic (cheap on resources).
 *  - State is a plain serialisable object persisted on the UserLab document.
 *  - Anything this engine doesn't understand falls back to the rich canned
 *    output in terminal-engine.js, so the full CCNA show-command library
 *    keeps working.
 */

import { executeCommand as cannedExecute } from "./terminal-engine.js";

// ─── Initial per-device state ────────────────────────────────────
export function initDeviceState(deviceName) {
  return {
    hostname: (deviceName || "Router").replace(/\s+/g, "-"),
    mode: "user", // user | priv | config | if | router | vlan | line
    ctx: null, // { kind: 'if'|'router'|'vlan'|'line', id: '...' }
    ipRouting: false,
    interfaces: {}, // name -> { ip, mask, shutdown, description }
    vlans: {}, // id -> { name }
    staticRoutes: [], // { prefix, mask, nh }
    ospf: null, // { proc, routerId, networks: [{net, wild, area}] }
  };
}

// ─── Prompt for the current mode ─────────────────────────────────
export function getPrompt(state) {
  const h = state.hostname || "Router";
  switch (state.mode) {
    case "priv": return `${h}#`;
    case "config": return `${h}(config)#`;
    case "if": return `${h}(config-if)#`;
    case "router": return `${h}(config-router)#`;
    case "vlan": return `${h}(config-vlan)#`;
    case "line": return `${h}(config-line)#`;
    default: return `${h}>`;
  }
}

// ─── Interface name normalisation (gi0/0 → GigabitEthernet0/0) ────
const IFACE_MAP = [
  [/^(gi|gig|gige|gigabitethernet)/, "GigabitEthernet"],
  [/^(fa|fas|fast|fastethernet)/, "FastEthernet"],
  [/^(te|ten|tengig|tengigabitethernet)/, "TenGigabitEthernet"],
  [/^(et|eth|ethernet)/, "Ethernet"],
  [/^(se|ser|serial)/, "Serial"],
  [/^(lo|loop|loopback)/, "Loopback"],
  [/^(vl|vlan)/, "Vlan"],
  [/^(po|port-channel|portchannel)/, "Port-channel"],
];

function normIface(raw) {
  if (!raw) return null;
  const s = raw.replace(/\s+/g, "").toLowerCase();
  const m = s.match(/^([a-z-]+)(\d.*)?$/);
  if (!m) return null;
  const prefix = m[1];
  const num = m[2] || "";
  for (const [re, full] of IFACE_MAP) {
    if (re.test(prefix)) return num ? `${full}${num}` : full;
  }
  return null;
}

// ─── Subnet maths (for dynamic show ip route) ────────────────────
function maskToCidr(mask) {
  if (!mask) return 24;
  return mask.split(".").reduce((acc, oct) => {
    const n = parseInt(oct, 10);
    return acc + ((n >>> 0).toString(2).split("1").length - 1);
  }, 0);
}

function networkAddress(ip, mask) {
  try {
    const ipParts = ip.split(".").map(Number);
    const mParts = mask.split(".").map(Number);
    return ipParts.map((o, i) => o & mParts[i]).join(".");
  } catch {
    return ip;
  }
}

const err = (msg) => ({ output: msg, isError: true });
const ok = (output = "") => ({ output, isError: false });

// ─── Dynamic show generators ─────────────────────────────────────
function showRunningConfig(state) {
  const lines = [
    "Building configuration...",
    "",
    "Current configuration : 1284 bytes",
    "!",
    "version 17.6",
    "service timestamps debug datetime msec",
    "service timestamps log datetime msec",
    "!",
    `hostname ${state.hostname}`,
    "!",
  ];
  if (state.ipRouting) lines.push("ip routing", "!");

  const ifaceNames = Object.keys(state.interfaces);
  if (ifaceNames.length === 0) {
    // Show the default physical interfaces even if untouched
    ["GigabitEthernet0/0", "GigabitEthernet0/1"].forEach((n) => {
      lines.push(`interface ${n}`, " no ip address", " shutdown", "!");
    });
  } else {
    ifaceNames.forEach((name) => {
      const i = state.interfaces[name];
      lines.push(`interface ${name}`);
      if (i.description) lines.push(` description ${i.description}`);
      if (i.ip && i.mask) lines.push(` ip address ${i.ip} ${i.mask}`);
      else lines.push(" no ip address");
      lines.push(i.shutdown ? " shutdown" : " no shutdown");
      lines.push("!");
    });
  }

  Object.keys(state.vlans).forEach((id) => {
    lines.push(`vlan ${id}`);
    if (state.vlans[id].name) lines.push(` name ${state.vlans[id].name}`);
    lines.push("!");
  });

  if (state.ospf) {
    lines.push(`router ospf ${state.ospf.proc}`);
    if (state.ospf.routerId) lines.push(` router-id ${state.ospf.routerId}`);
    (state.ospf.networks || []).forEach((n) =>
      lines.push(` network ${n.net} ${n.wild} area ${n.area}`)
    );
    lines.push("!");
  }

  state.staticRoutes.forEach((r) =>
    lines.push(`ip route ${r.prefix} ${r.mask} ${r.nh}`)
  );
  if (state.staticRoutes.length) lines.push("!");

  lines.push("line con 0", "!", "line vty 0 4", " login", "!", "end");
  return ok(lines.join("\n"));
}

function showIpIntBrief(state) {
  const header =
    "Interface              IP-Address      OK? Method Status                Protocol";
  const rows = [];
  const names = Object.keys(state.interfaces);
  if (names.length === 0) {
    ["GigabitEthernet0/0", "GigabitEthernet0/1"].forEach((n) => {
      rows.push(
        `${n.padEnd(23)}unassigned      YES unset  administratively down down`
      );
    });
  } else {
    names.forEach((n) => {
      const i = state.interfaces[n];
      const ip = (i.ip || "unassigned").padEnd(16);
      const status = i.shutdown
        ? "administratively down down"
        : i.ip
        ? "up                    up"
        : "down                  down";
      const method = i.ip ? "manual" : "unset ";
      rows.push(`${n.padEnd(23)}${ip}YES ${method} ${status}`);
    });
  }
  return ok([header, ...rows].join("\n"));
}

function showIpRoute(state) {
  const codes =
    "Codes: C - connected, S - static, O - OSPF\n";
  const routes = [];
  Object.entries(state.interfaces).forEach(([name, i]) => {
    if (i.ip && i.mask && !i.shutdown) {
      const net = networkAddress(i.ip, i.mask);
      const cidr = maskToCidr(i.mask);
      routes.push(`C        ${net}/${cidr} is directly connected, ${name}`);
      routes.push(`L        ${i.ip}/32 is directly connected, ${name}`);
    }
  });
  state.staticRoutes.forEach((r) => {
    const cidr = maskToCidr(r.mask);
    routes.push(`S        ${r.prefix}/${cidr} [1/0] via ${r.nh}`);
  });
  const gw = state.staticRoutes.find((r) => r.prefix === "0.0.0.0");
  const gline = gw
    ? `Gateway of last resort is ${gw.nh} to network 0.0.0.0\n`
    : "Gateway of last resort is not set\n";
  if (routes.length === 0) {
    return ok(codes + "\n" + gline + "\n(no routes configured yet)");
  }
  return ok(codes + "\n" + gline + "\n" + routes.join("\n"));
}

function showVlanBrief(state) {
  const header =
    "VLAN Name                             Status    Ports\n" +
    "---- -------------------------------- --------- -------------------------------\n" +
    "1    default                          active";
  const rows = Object.entries(state.vlans).map(([id, v]) => {
    const name = (v.name || `VLAN${id.padStart(4, "0")}`).padEnd(32);
    return `${id.padEnd(5)}${name} active`;
  });
  return ok([header, ...rows].join("\n"));
}

// ─── Main entry point ────────────────────────────────────────────
// Returns { output, isError, state }. Always mutates/returns state.
export function runIOS(rawCommand, state) {
  if (!state) state = initDeviceState("Router");
  const command = (rawCommand || "").trim();
  const cmd = command.toLowerCase().replace(/\s+/g, " ");
  const tokens = cmd.split(" ");

  // Blank line → just a new prompt
  if (cmd === "") return { ...ok(""), state };

  // ── Help ──
  if (cmd === "?") {
    const help =
      state.mode === "user" || state.mode === "priv"
        ? "Exec commands:\n  enable            Turn on privileged commands\n  configure         Enter configuration mode\n  show              Show running system information\n  ping              Send echo messages"
        : "Configuration commands:\n  hostname          Set system's network name\n  interface         Select an interface to configure\n  ip                Global IP configuration\n  router            Enable a routing process\n  exit / end        Leave configuration mode";
    return { ...ok(help), state };
  }

  // ── Mode transitions ──
  if (cmd === "enable" || cmd === "en" || cmd === "ena") {
    state.mode = state.mode === "user" ? "priv" : state.mode;
    if (["if", "router", "vlan", "line", "config"].includes(state.mode))
      state.mode = "priv";
    return { ...ok(""), state };
  }
  if (cmd === "disable") {
    state.mode = "user";
    return { ...ok(""), state };
  }
  if (cmd === "configure terminal" || cmd === "conf t" || cmd === "config t" || cmd === "configure") {
    if (state.mode !== "priv") return { ...err("% Use 'enable' to enter privileged mode first."), state };
    state.mode = "config";
    return { ...ok("Enter configuration commands, one per line.  End with CNTL/Z."), state };
  }
  if (cmd === "end") {
    if (["config", "if", "router", "vlan", "line"].includes(state.mode)) {
      state.mode = "priv";
      state.ctx = null;
    }
    return { ...ok(""), state };
  }
  if (cmd === "exit" || cmd === "quit") {
    switch (state.mode) {
      case "if":
      case "router":
      case "vlan":
      case "line":
        state.mode = "config";
        state.ctx = null;
        break;
      case "config":
        state.mode = "priv";
        break;
      case "priv":
        state.mode = "user";
        break;
      default:
        break;
    }
    return { ...ok(""), state };
  }

  // ── Global config commands (require config or deeper) ──
  const inConfig = ["config", "if", "router", "vlan", "line"].includes(state.mode);

  if (tokens[0] === "hostname" && inConfig) {
    if (!tokens[1]) return { ...err("% Incomplete command."), state };
    state.hostname = command.split(/\s+/)[1];
    return { ...ok(""), state };
  }

  if (tokens[0] === "ip" && tokens[1] === "routing" && inConfig) {
    state.ipRouting = true;
    return { ...ok(""), state };
  }
  if (tokens[0] === "no" && tokens[1] === "ip" && tokens[2] === "routing" && inConfig) {
    state.ipRouting = false;
    return { ...ok(""), state };
  }

  // interface X
  if (tokens[0] === "interface" || (tokens[0] === "int" && tokens[1])) {
    if (!inConfig) return { ...err("% Invalid input detected. Enter 'configure terminal' first."), state };
    const rest = command.split(/\s+/).slice(1).join("");
    const name = normIface(rest);
    if (!name) return { ...err("% Invalid interface."), state };
    if (!state.interfaces[name]) state.interfaces[name] = { ip: null, mask: null, shutdown: true, description: "" };
    state.mode = "if";
    state.ctx = { kind: "if", id: name };
    return { ...ok(""), state };
  }

  // interface-context commands
  if (state.mode === "if" && state.ctx) {
    const iface = state.interfaces[state.ctx.id];
    if (tokens[0] === "ip" && tokens[1] === "address") {
      const parts = command.split(/\s+/);
      if (!parts[2] || !parts[3]) return { ...err("% Incomplete command."), state };
      iface.ip = parts[2];
      iface.mask = parts[3];
      return { ...ok(""), state };
    }
    if (tokens[0] === "no" && tokens[1] === "ip" && tokens[2] === "address") {
      iface.ip = null; iface.mask = null;
      return { ...ok(""), state };
    }
    if (cmd === "no shutdown" || cmd === "no shut") {
      iface.shutdown = false;
      return { ...ok(`%LINK-3-UPDOWN: Interface ${state.ctx.id}, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ${state.ctx.id}, changed state to up`), state };
    }
    if (cmd === "shutdown" || cmd === "shut") {
      iface.shutdown = true;
      return { ...ok(`%LINK-5-CHANGED: Interface ${state.ctx.id}, changed state to administratively down`), state };
    }
    if (tokens[0] === "description") {
      iface.description = command.split(/\s+/).slice(1).join(" ");
      return { ...ok(""), state };
    }
    // accept other interface sub-commands silently (switchport, duplex, speed…)
    if (["switchport", "duplex", "speed", "encapsulation", "channel-group", "ip", "no", "cdp", "mtu", "bandwidth", "standby"].includes(tokens[0])) {
      return { ...ok(""), state };
    }
  }

  // vlan N
  if (tokens[0] === "vlan" && inConfig && /^\d+$/.test(tokens[1] || "")) {
    state.vlans[tokens[1]] = state.vlans[tokens[1]] || { name: "" };
    state.mode = "vlan";
    state.ctx = { kind: "vlan", id: tokens[1] };
    return { ...ok(""), state };
  }
  if (state.mode === "vlan" && tokens[0] === "name" && state.ctx) {
    state.vlans[state.ctx.id].name = command.split(/\s+/).slice(1).join(" ");
    return { ...ok(""), state };
  }

  // router ospf N
  if (tokens[0] === "router" && tokens[1] === "ospf" && inConfig) {
    state.ospf = state.ospf || { proc: tokens[2] || "1", routerId: null, networks: [] };
    state.ospf.proc = tokens[2] || "1";
    state.mode = "router";
    state.ctx = { kind: "router", id: "ospf" };
    return { ...ok(""), state };
  }
  if (state.mode === "router" && state.ospf) {
    if (tokens[0] === "router-id") {
      state.ospf.routerId = tokens[1];
      return { ...ok(""), state };
    }
    if (tokens[0] === "network") {
      const p = command.split(/\s+/);
      // network <net> <wild> area <id>
      const areaIdx = p.indexOf("area");
      state.ospf.networks.push({
        net: p[1] || "",
        wild: p[2] || "0.0.0.0",
        area: areaIdx > -1 ? p[areaIdx + 1] : "0",
      });
      return { ...ok(""), state };
    }
    // other router protocols / sub-commands accepted silently
    if (["eigrp", "bgp", "rip", "passive-interface", "no", "auto-summary", "neighbor", "redistribute"].includes(tokens[0])) {
      return { ...ok(""), state };
    }
  }

  // router eigrp/bgp/rip (tracked loosely — enter router mode)
  if (tokens[0] === "router" && ["eigrp", "bgp", "rip"].includes(tokens[1]) && inConfig) {
    state.mode = "router";
    state.ctx = { kind: "router", id: tokens[1] };
    return { ...ok(""), state };
  }

  // static route
  if (tokens[0] === "ip" && tokens[1] === "route" && inConfig) {
    const p = command.split(/\s+/);
    if (p[2] && p[3] && p[4]) {
      state.staticRoutes.push({ prefix: p[2], mask: p[3], nh: p[4] });
      return { ...ok(""), state };
    }
    return { ...err("% Incomplete command."), state };
  }
  if (tokens[0] === "no" && tokens[1] === "ip" && tokens[2] === "route" && inConfig) {
    const p = command.split(/\s+/);
    state.staticRoutes = state.staticRoutes.filter(
      (r) => !(r.prefix === p[3] && r.mask === p[4])
    );
    return { ...ok(""), state };
  }

  // line vty / line con
  if (tokens[0] === "line" && inConfig) {
    state.mode = "line";
    state.ctx = { kind: "line", id: tokens.slice(1).join(" ") };
    return { ...ok(""), state };
  }
  if (state.mode === "line") {
    if (["login", "password", "transport", "exec-timeout", "logging", "no"].includes(tokens[0])) {
      return { ...ok(""), state };
    }
  }

  // ── show commands that depend on state ──
  if (cmd === "show running-config" || cmd === "show run" || cmd === "sh run" || cmd === "show startup-config") {
    return { ...showRunningConfig(state), state };
  }
  if (cmd === "show ip interface brief" || cmd === "show ip int brief" || cmd === "sh ip int br") {
    return { ...showIpIntBrief(state), state };
  }
  if (cmd === "show ip route" && (Object.keys(state.interfaces).length > 0 || state.staticRoutes.length > 0)) {
    return { ...showIpRoute(state), state };
  }
  if ((cmd === "show vlan brief" || cmd === "show vlan") && Object.keys(state.vlans).length > 0) {
    return { ...showVlanBrief(state), state };
  }

  // write / save
  if (cmd === "write" || cmd === "write memory" || cmd === "wr" || cmd.startsWith("copy run")) {
    return { ...ok("Building configuration...\n[OK]"), state };
  }

  // ── Reject EXEC-only mistakes: config command typed before enable/config ──
  const looksLikeConfig =
    ["hostname", "interface", "router", "vlan"].includes(tokens[0]) ||
    (tokens[0] === "ip" && ["address", "route", "routing"].includes(tokens[1]));
  if (looksLikeConfig && !inConfig) {
    return { ...err("% Invalid input detected at '^' marker. (enter configuration mode first)"), state };
  }

  // ── Fallback: rich canned output for advanced show/diagnostic commands ──
  const canned = cannedExecute(command, state.hostname);
  // The legacy engine sometimes returns a bare prompt string for config
  // commands; treat those as silent success so we don't echo a stray prompt.
  if (canned.output && /\(config[^)]*\)#$/.test(canned.output.trim())) {
    return { ...ok(""), state };
  }
  return { output: canned.output, isError: canned.isError, state };
}
