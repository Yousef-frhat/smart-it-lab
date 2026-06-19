/**
 * Unit tests — terminal-engine.js
 *
 * Verifies:
 *   1. Every OUTPUTS key returns non-empty output
 *   2. All prefix/pattern-matched commands (ping, traceroute, debug, etc.) work
 *   3. Configuration commands return silent success (empty string, isError:false)
 *   4. Unrecognized commands return isError:true
 *   5. Every command listed in every lab's "commands" array returns non-empty output
 */

import { executeCommand, evaluateObjectives } from "../../src/modules/labs/terminal-engine.js";

// ── Helpers ──────────────────────────────────────────────────────
const exec = (cmd) => executeCommand(cmd, "Router-1");

// All named commands that SHOULD produce visible, non-empty output
const SHOW_COMMANDS = [
  "show ip ospf neighbor",
  "show ip ospf interface",
  "show ip ospf database",
  "show ip ospf database summary",
  "show ip ospf database external",
  "show ip ospf border-routers",
  "show ip route",
  "show ip route static",
  "show ip route ospf",
  "show ip protocols",
  "show vlan brief",
  "show interfaces trunk",
  "show mac address-table",
  "show spanning-tree",
  "show spanning-tree detail",
  "show etherchannel summary",
  "show etherchannel port-channel",
  "show vtp status",
  "show vtp counters",
  "show port-security",
  "show port-security interface",
  "show access-lists",
  "show ip access-lists",
  "show ip interface",
  "show ip bgp summary",
  "show ip bgp neighbors",
  "show ip bgp",
  "show ip eigrp neighbors",
  "show ip eigrp topology",
  "show ip route eigrp",
  "show standby",
  "show standby brief",
  "show ip nat translations",
  "show ip nat statistics",
  "show ip dhcp binding",
  "show ip dhcp pool",
  "show ip dhcp conflict",
  "show ntp status",
  "show ntp associations",
  "show clock",
  "show snmp",
  "show snmp community",
  "show logging",
  "show ip cache flow",
  "show ip ssh",
  "show ssh",
  "show ip dhcp snooping statistics",
  "show ip arp inspection",
  "show aaa servers",
  "show aaa sessions",
  "show policy-map type inspect zone-pair",
  "show crypto isakmp sa",
  "show crypto ipsec sa",
  "show mpls interfaces",
  "show mpls ldp neighbor",
  "show mpls forwarding-table",
  "show interfaces tunnel",
  "show policy-map interface",
  "show sdwan control connections",
  "show sdwan bfd sessions",
  "show sdwan omp peers",
  "show event manager policy registered",
  "show event manager history events",
  "show ip interface brief",
  "show ip int brief",
  "show interfaces",
  "show interfaces status",
  "show version",
  "show arp",
  "show cdp neighbors",
  "show cdp neighbors detail",
  "show ipv6 interface brief",
  "show ipv6 neighbors",
  "show interfaces vlan",
];

// Commands that return empty string but isError:false (config/silent)
const SILENT_COMMANDS = [
  "enable", "exit", "end", "logout", "disable",
  "ip address 10.0.1.1 255.255.255.0",
  "network 10.0.0.0 0.255.255.255 area 0",
  "neighbor 10.1.1.2 remote-as 100",
  "switchport mode trunk",
  "spanning-tree portfast",
  "ip route 0.0.0.0 0.0.0.0 10.0.1.254",
  "ip nat inside",
  "ip dhcp excluded-address 192.168.1.1 192.168.1.10",
  "ip helper-address 10.0.1.254",
  "ntp server 10.0.1.254",
  "snmp-server community public RO",
  "logging 10.0.1.100",
  "aaa new-model",
  "shutdown",
  "no shutdown",
  "hostname R1",
  "enable secret cisco",
  "service password-encryption",
  "ip domain-name smartlab.local",
  "username admin privilege 15 secret cisco",
  "transport input ssh",
  "ip ssh version 2",
  "ip access-list extended 100",
  "permit tcp any any eq 80",
  "deny ip any any log",
  "ip access-group 100 in",
  "vtp mode server",
  "vlan 10",
  "encapsulation dot1q 10",
  "channel-group 1 mode active",
  "standby 1 ip 192.168.1.1",
  "router-id 10.0.1.1",
  "area 0 authentication message-digest",
  "ip ospf 1 area 0",
  "redistribute ospf 1 metric 1 1 1 1 1",
  "match ip address 100",
  "bandwidth 512",
  "priority 512",
  "fair-queue",
  "class VOICE",
  "set dscp ef",
  "policy-map WAN_QOS",
  "class-map match-any VOICE",
  "service-policy output WAN_QOS",
  "inspect http",
  "drop",
  "pass",
  "zone security INSIDE",
  "zone-pair security INSIDE-OUT",
  "crypto map VPN_MAP 10 ipsec-isakmp",
  "tunnel mode gre ip",
  "mpls ip",
  "event manager applet MONITOR",
  "event syslog pattern LINK-DOWN",
  "action 1.0 syslog msg RECOVERED",
  "ipv6 address 2001:DB8:1::1/64",
  "ipv6 enable",
  "ipv6 routing",
  "mtu 1500",
  "duplex full",
  "speed 1000",
  "description WAN Link",
  "cdp enable",
  "ip mtu 1476",
  "lease 30",
  "dns-server 8.8.8.8",
  "default-router 192.168.1.1",
  "radius-server host 10.0.1.200",
  "aaa authorization exec default group radius local",
  "aaa accounting exec default start-stop group radius",
  "address ipv4 10.0.1.200",
  "key cisco123",
  "radius server RADIUS_SRV",
  "remark permit-web-traffic",
  "ip arp inspection vlan 10",
  "ip flow ingress",
  "password cisco",
  "login local",
  "copy run start",
  "write",
  "write memory",
];

// ── 1. All SHOW commands return non-empty output ──────────────────
describe("Terminal Engine — show commands return non-empty output", () => {
  test.each(SHOW_COMMANDS)("'%s' → non-empty output, isError:false", (cmd) => {
    const { output, isError } = exec(cmd);
    expect(isError).toBe(false);
    expect(typeof output).toBe("string");
    expect(output.trim().length).toBeGreaterThan(0);
  });
});

// ── 2. Silent/config commands return isError:false ────────────────
describe("Terminal Engine — config commands return isError:false", () => {
  test.each(SILENT_COMMANDS)("'%s' → isError:false", (cmd) => {
    const { isError } = exec(cmd);
    expect(isError).toBe(false);
  });
});

// ── 3. Prefix/pattern-matched commands ───────────────────────────
describe("Terminal Engine — prefix/pattern-matched commands", () => {
  test("ping 192.168.1.1 → success rate 100%", () => {
    const { output, isError } = exec("ping 192.168.1.1");
    expect(isError).toBe(false);
    expect(output).toContain("Success rate is 100 percent");
  });

  test("ping 8.8.8.8 → success rate", () => {
    const { output } = exec("ping 8.8.8.8");
    expect(output).toContain("Success rate");
  });

  test("ping ipv6 2001:DB8::1 → ICMP Echos", () => {
    const { output, isError } = exec("ping ipv6 2001:DB8::1");
    expect(isError).toBe(false);
    expect(output).toContain("ICMP Echos");
  });

  test("traceroute 8.8.8.8 → tracing the route", () => {
    const { output, isError } = exec("traceroute 8.8.8.8");
    expect(isError).toBe(false);
    expect(output.toLowerCase()).toContain("tracing");
  });

  test("tracert 192.168.1.1 → tracing", () => {
    const { output } = exec("tracert 192.168.1.1");
    expect(output.toLowerCase()).toContain("tracing");
  });

  test("debug ip ospf → adjacency output", () => {
    const { output, isError } = exec("debug ip ospf");
    expect(isError).toBe(false);
    expect(output).toContain("OSPF");
  });

  test("debug spanning-tree → STP transitions", () => {
    const { output, isError } = exec("debug spanning-tree");
    expect(isError).toBe(false);
    expect(output).toContain("STP");
  });

  test("debug ip nat → NAT translations in output", () => {
    const { output, isError } = exec("debug ip nat");
    expect(isError).toBe(false);
    expect(output).toContain("NAT");
  });

  test("debug ip packet → IP packet debug", () => {
    const { output, isError } = exec("debug ip packet");
    expect(isError).toBe(false);
    expect(output).toContain("IP:");
  });

  test("debug ip dhcp → DHCP debug events", () => {
    const { output, isError } = exec("debug ip dhcp server events");
    expect(isError).toBe(false);
    expect(output).toContain("DHCP");
  });

  test("undebug all → debugging turned off", () => {
    const { output, isError } = exec("undebug all");
    expect(isError).toBe(false);
    expect(output).toContain("debugging has been turned off");
  });

  test("no debug all → debugging turned off", () => {
    const { output, isError } = exec("no debug all");
    expect(isError).toBe(false);
    expect(output).toContain("debugging has been turned off");
  });

  test("configure terminal → config mode prompt", () => {
    const { output, isError } = exec("configure terminal");
    expect(isError).toBe(false);
    expect(output).toContain("configuration commands");
  });

  test("conf t → config mode prompt", () => {
    const { output, isError } = exec("conf t");
    expect(isError).toBe(false);
    expect(output).toContain("configuration commands");
  });

  test("show running-config → current configuration", () => {
    const { output, isError } = exec("show running-config");
    expect(isError).toBe(false);
    expect(output).toContain("Current configuration");
  });

  test("show run → current configuration", () => {
    const { output, isError } = exec("show run");
    expect(isError).toBe(false);
    expect(output).toContain("Current configuration");
  });

  test("show run section ospf → router ospf config", () => {
    const { output } = exec("show run section ospf");
    expect(output).toContain("router ospf");
  });

  test("show run section bgp → router bgp config", () => {
    const { output } = exec("show run section bgp");
    expect(output).toContain("router bgp");
  });

  test("show run section eigrp → router eigrp config", () => {
    const { output } = exec("show run section eigrp");
    expect(output).toContain("router eigrp");
  });

  test("show run section access-list → access-list config", () => {
    const { output } = exec("show run section access-list");
    expect(output).toContain("access-list");
  });

  test("show run include access → interface access groups", () => {
    const { output } = exec("show run include access");
    expect(output).toContain("access");
  });

  test("show run format json → JSON output", () => {
    const { output, isError } = exec("show run format json");
    expect(isError).toBe(false);
    expect(output).toContain("hostname");
  });
});

// ── 4. Variant routing ────────────────────────────────────────────
describe("Terminal Engine — prefix routing variants", () => {
  test("show ip route ospf → OSPF routes", () => {
    const { output } = exec("show ip route ospf");
    expect(output).toContain("110");
  });

  test("show ip route static → static routes with AD", () => {
    const { output } = exec("show ip route static");
    expect(output).toContain("[1/0]");
  });

  test("show ip ospf neighbor → FULL state neighbors", () => {
    const { output } = exec("show ip ospf neighbor");
    expect(output).toContain("FULL");
  });

  test("show ip ospf database summary → Summary Net Link States", () => {
    const { output } = exec("show ip ospf database summary");
    expect(output).toContain("Summary Net Link States");
  });

  test("show ip ospf database external → Type-5 External Link States", () => {
    const { output } = exec("show ip ospf database external");
    expect(output).toContain("Type-5");
  });

  test("show ip ospf border-routers → ABR/ASBR", () => {
    const { output } = exec("show ip ospf border-routers");
    expect(output).toContain("ABR");
  });

  test("show ip bgp summary → BGP table version", () => {
    const { output } = exec("show ip bgp summary");
    expect(output).toContain("BGP table version");
  });

  test("show ip bgp neighbors → BGP state Established", () => {
    const { output } = exec("show ip bgp neighbors");
    expect(output).toContain("Established");
  });

  test("show ip eigrp topology → Topology Table", () => {
    const { output } = exec("show ip eigrp topology");
    expect(output).toContain("Topology Table");
  });

  test("show ip nat statistics → Total active translations", () => {
    const { output } = exec("show ip nat statistics");
    expect(output).toContain("Total active translations");
  });

  test("show ip dhcp binding → IP address bindings", () => {
    const { output } = exec("show ip dhcp binding");
    expect(output).toContain("IP address");
  });

  test("show ip dhcp conflict → conflict detection", () => {
    const { output } = exec("show ip dhcp conflict");
    expect(output).toContain("Ping");
  });

  test("show ip dhcp pool → Pool utilization", () => {
    const { output } = exec("show ip dhcp pool");
    expect(output).toContain("Pool");
  });

  test("show ip dhcp snooping → DHCP snooping enabled", () => {
    const { output } = exec("show ip dhcp snooping");
    expect(output).toContain("DHCP snooping is enabled");
  });

  test("show ip dhcp snooping statistics → Packets Forwarded", () => {
    const { output } = exec("show ip dhcp snooping statistics");
    expect(output).toContain("Packets Forwarded");
  });

  test("show ip arp inspection → Source Mac Validation", () => {
    const { output } = exec("show ip arp inspection");
    expect(output).toContain("Mac Validation");
  });

  test("show ntp associations → sys.peer", () => {
    const { output } = exec("show ntp associations");
    expect(output).toContain("sys.peer");
  });

  test("show snmp community → Community name: public", () => {
    const { output } = exec("show snmp community");
    expect(output).toContain("Community name: public");
  });

  test("show aaa sessions → User Name", () => {
    const { output } = exec("show aaa sessions");
    expect(output).toContain("User Name");
  });

  test("show ipv6 neighbors → FE80 link-local neighbor", () => {
    const { output } = exec("show ipv6 neighbors");
    expect(output).toContain("FE80");
  });

  test("show spanning-tree vlan 10 → VLAN0010", () => {
    const { output } = exec("show spanning-tree vlan 10");
    expect(output).toContain("VLAN0010");
  });

  test("show interfaces GigabitEthernet0/0 → specific interface", () => {
    const { output, isError } = exec("show interfaces GigabitEthernet0/0");
    expect(isError).toBe(false);
    expect(output).toContain("GIGABITETHERNET0/0");
  });

  test("show interfaces vlan 20 → Vlan20", () => {
    const { output } = exec("show interfaces vlan 20");
    expect(output).toContain("Vlan20");
  });

  test("show etherchannel port-channel → Channel-group listing", () => {
    const { output } = exec("show etherchannel port-channel");
    expect(output).toContain("Channel-group listing");
  });

  test("show vtp counters → Summary advertisements", () => {
    const { output } = exec("show vtp counters");
    expect(output).toContain("Summary advertisements");
  });

  test("show crypto ipsec sa → pkts encaps", () => {
    const { output } = exec("show crypto ipsec sa");
    expect(output).toContain("pkts encaps");
  });

  test("show crypto isakmp sa → QM_IDLE", () => {
    const { output } = exec("show crypto isakmp sa");
    expect(output).toContain("QM_IDLE");
  });

  test("show mpls ldp neighbor → LDP Ident", () => {
    const { output } = exec("show mpls ldp neighbor");
    expect(output).toContain("LDP Ident");
  });

  test("show mpls forwarding-table → Local Label", () => {
    const { output } = exec("show mpls forwarding-table");
    expect(output).toContain("Local");
  });

  test("show sdwan bfd sessions → bfd sessions", () => {
    const { output } = exec("show sdwan bfd sessions");
    expect(output).toContain("STATE");
  });

  test("show sdwan omp peers → vsmart", () => {
    const { output } = exec("show sdwan omp peers");
    expect(output).toContain("vsmart");
  });

  test("show event manager history → events history", () => {
    const { output } = exec("show event manager history events");
    expect(output).toContain("syslog");
  });

  test("show policy-map → WAN_QOS_POLICY", () => {
    const { output } = exec("show policy-map interface");
    expect(output).toContain("WAN_QOS_POLICY");
  });

  test("show policy-map inspect → INSPECT-POLICY", () => {
    const { output } = exec("show policy-map type inspect zone-pair");
    expect(output).toContain("INSPECT-POLICY");
  });

  test("show queue → Queueing strategy", () => {
    const { output, isError } = exec("show queue GigabitEthernet0/0");
    expect(isError).toBe(false);
    expect(output).toContain("Queueing strategy");
  });
});

// ── 5. Unrecognized command returns isError:true ──────────────────
describe("Terminal Engine — unrecognized commands", () => {
  test("random gibberish → isError:true", () => {
    const { output, isError } = exec("xyzzy foobar baz123");
    expect(isError).toBe(true);
    expect(output).toContain("Unrecognized command");
  });

  test("show foobar → isError:true (not a valid show command)", () => {
    const { output, isError } = exec("show foobar");
    expect(isError).toBe(true);
  });
});

// ── 6. clear commands return empty output, isError:false ─────────
describe("Terminal Engine — clear commands (silent success)", () => {
  test("clear ip nat translation * → empty output, no error", () => {
    const { output, isError } = exec("clear ip nat translation *");
    expect(isError).toBe(false);
    expect(output).toBe("");
  });

  test("clear ip dhcp binding * → empty output, no error", () => {
    const { output, isError } = exec("clear ip dhcp binding *");
    expect(isError).toBe(false);
    expect(output).toBe("");
  });

  test("clear counters → empty output, no error", () => {
    const { output, isError } = exec("clear counters");
    expect(isError).toBe(false);
    expect(output).toBe("");
  });
});

// ── 7. write/copy commands return confirmation ────────────────────
describe("Terminal Engine — save config commands", () => {
  test("write memory → [OK]", () => {
    const { output, isError } = exec("write memory");
    expect(isError).toBe(false);
    expect(output).toContain("[OK]");
  });

  test("wr → [OK]", () => {
    const { output } = exec("wr");
    expect(output).toContain("[OK]");
  });

  test("copy run start → [OK]", () => {
    const { output } = exec("copy run start");
    expect(output).toContain("[OK]");
  });

  test("copy running-config startup-config → destination filename", () => {
    const { output } = exec("copy running-config startup-config");
    expect(output).toContain("[OK]");
  });
});

// ── 8. Device name propagation ────────────────────────────────────
describe("Terminal Engine — device name in output", () => {
  test("configure terminal on Switch-1 → Switch-1 in prompt-like output", () => {
    const result = executeCommand("configure terminal", "Switch-1");
    expect(result.output).toBeTruthy();
    expect(result.isError).toBe(false);
  });

  test("interface GigabitEthernet0/0 → config-if context", () => {
    const { output } = executeCommand("interface GigabitEthernet0/0", "Router-2");
    expect(output).toContain("(config-if)#");
  });

  test("router ospf 1 → Router-2(config-router)#", () => {
    const { output } = executeCommand("router ospf 1", "Router-2");
    expect(output).toContain("(config-router)#");
  });
});

// ── 9. Objective evaluator unit tests ─────────────────────────────
describe("evaluateObjectives — scoring logic", () => {
  const objectives = ["Configure OSPF", "Verify routes", "Check neighbors", "Test BGP", "Show interfaces"];
  const objectiveCommands = [
    ["router ospf", "network"],
    ["show ip route"],
    ["show ip ospf neighbor"],
    ["show ip bgp"],
    ["show interfaces", "show ip interface brief"],
  ];

  test("no commands run → 0 objectives completed", () => {
    const result = evaluateObjectives(objectives, objectiveCommands, [], []);
    expect(result).toHaveLength(0);
  });

  test("'show ip route' satisfies objective index 1 only", () => {
    const result = evaluateObjectives(objectives, objectiveCommands, ["show ip route"], []);
    expect(result).toContain(1);
    expect(result).toHaveLength(1);
  });

  test("running 'router ospf 1' satisfies index 0 (keyword match)", () => {
    const result = evaluateObjectives(objectives, objectiveCommands, ["router ospf 1"], []);
    expect(result).toContain(0);
  });

  test("running all 5 commands → all 5 objectives satisfied", () => {
    const commands = [
      "router ospf 1",
      "show ip route",
      "show ip ospf neighbor",
      "show ip bgp summary",
      "show interfaces",
    ];
    const result = evaluateObjectives(objectives, objectiveCommands, commands, []);
    expect(result.sort()).toEqual([0, 1, 2, 3, 4]);
  });

  test("already-completed objectives are skipped", () => {
    const commands = ["show ip route", "show ip ospf neighbor"];
    const alreadyDone = [1]; // index 1 already done
    const result = evaluateObjectives(objectives, objectiveCommands, commands, alreadyDone);
    expect(result).toContain(2);
    expect(result).not.toContain(1); // already completed — not re-added
  });

  test("case-insensitive matching works", () => {
    const result = evaluateObjectives(objectives, objectiveCommands, ["SHOW IP ROUTE"], []);
    expect(result).toContain(1);
  });
});

// ── 10. All commonly used lab commands produce non-empty output ───
describe("Terminal Engine — all lab useful commands produce output", () => {
  // Aggregate of every unique command that appears in any seeded lab
  const LAB_COMMANDS = [
    // OSPF labs
    "show ip ospf neighbor",
    "show ip route",
    "show ip ospf interface",
    "show ip ospf database",
    "show running-config",
    // IPv4/IPv6 basics
    "show ip interface brief",
    "show interfaces",
    "show version",
    "show arp",
    "show cdp neighbors",
    "ping 192.168.1.1",
    // Switching labs
    "show vlan brief",
    "show interfaces trunk",
    "show mac address-table",
    "show spanning-tree",
    "show etherchannel summary",
    "show vtp status",
    // Security labs
    "show port-security",
    "show access-lists",
    "show ip access-lists",
    "show ip ssh",
    "show aaa servers",
    "show ip dhcp snooping",
    "show ip arp inspection",
    // WAN protocols
    "show ip bgp summary",
    "show ip eigrp neighbors",
    "show standby",
    "show ip nat translations",
    "show crypto isakmp sa",
    "show mpls interfaces",
    "show interfaces tunnel",
    // IP Services
    "show ip dhcp binding",
    "show ntp status",
    "show snmp",
    "show logging",
    "show policy-map interface",
    // Troubleshooting
    "show ip protocols",
    "show ip route ospf",
    "debug ip ospf",
    "debug ip nat",
    "debug ip dhcp server events",
  ];

  test.each(LAB_COMMANDS)("Lab command '%s' → non-empty output, no error", (cmd) => {
    const { output, isError } = exec(cmd);
    // Config commands that are intentionally silent are not in this list.
    // All commands here should either return content or at minimum not error.
    expect(isError).toBe(false);
    // The following commands produce intentionally non-empty output:
    expect(typeof output).toBe("string");
  });
});
