import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./schemas/user.model.js";
import Lab from "./schemas/lab.model.js";
import Achievement from "./schemas/achievement.model.js";
import ServerMetric from "./schemas/server-metric.model.js";
import UserSettings from "./schemas/user-settings.model.js";

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Default topology for labs that don't need a specific one Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const defaultTopology = [
  { nodeId: "r1", type: "router", name: "Router-1", position: { x: 200, y: 200 }, ip: "10.0.1.1", status: "active", connections: ["r2", "sw1"] },
  { nodeId: "r2", type: "router", name: "Router-2", position: { x: 500, y: 200 }, ip: "10.0.2.1", status: "active", connections: ["r1", "sw2"] },
  { nodeId: "sw1", type: "switch", name: "Switch-1", position: { x: 200, y: 400 }, status: "active", connections: ["r1", "pc1"] },
  { nodeId: "sw2", type: "switch", name: "Switch-2", position: { x: 500, y: 400 }, status: "active", connections: ["r2", "pc2"] },
  { nodeId: "pc1", type: "pc", name: "PC-1", position: { x: 200, y: 550 }, ip: "192.168.1.10", status: "active", connections: ["sw1"] },
  { nodeId: "pc2", type: "pc", name: "PC-2", position: { x: 500, y: 550 }, ip: "192.168.2.10", status: "active", connections: ["sw2"] },
];

const switchTopology = [
  { nodeId: "sw1", type: "switch", name: "Core-Switch", position: { x: 400, y: 200 }, status: "active", connections: ["sw2", "sw3"] },
  { nodeId: "sw2", type: "switch", name: "Access-SW-1", position: { x: 200, y: 400 }, status: "active", connections: ["sw1", "pc1", "pc2"] },
  { nodeId: "sw3", type: "switch", name: "Access-SW-2", position: { x: 600, y: 400 }, status: "active", connections: ["sw1", "pc3", "pc4"] },
  { nodeId: "pc1", type: "pc", name: "PC-VLAN10", position: { x: 100, y: 550 }, ip: "192.168.10.10", status: "active", connections: ["sw2"] },
  { nodeId: "pc2", type: "pc", name: "PC-VLAN20", position: { x: 300, y: 550 }, ip: "192.168.20.10", status: "active", connections: ["sw2"] },
  { nodeId: "pc3", type: "pc", name: "PC-VLAN30", position: { x: 500, y: 550 }, ip: "192.168.30.10", status: "active", connections: ["sw3"] },
  { nodeId: "pc4", type: "pc", name: "PC-VLAN40", position: { x: 700, y: 550 }, ip: "192.168.40.10", status: "active", connections: ["sw3"] },
];

const wanTopology = [
  { nodeId: "r1", type: "router", name: "HQ-Router", position: { x: 150, y: 200 }, ip: "203.0.113.1", status: "active", connections: ["cloud", "sw1"] },
  { nodeId: "r2", type: "router", name: "Branch-Router", position: { x: 650, y: 200 }, ip: "203.0.113.2", status: "active", connections: ["cloud", "sw2"] },
  { nodeId: "cloud", type: "cloud", name: "Internet/WAN", position: { x: 400, y: 100 }, status: "active", connections: ["r1", "r2"] },
  { nodeId: "sw1", type: "switch", name: "HQ-Switch", position: { x: 150, y: 400 }, status: "active", connections: ["r1", "pc1"] },
  { nodeId: "sw2", type: "switch", name: "Branch-Switch", position: { x: 650, y: 400 }, status: "active", connections: ["r2", "pc2"] },
  { nodeId: "pc1", type: "pc", name: "HQ-PC", position: { x: 150, y: 550 }, ip: "10.0.1.10", status: "active", connections: ["sw1"] },
  { nodeId: "pc2", type: "pc", name: "Branch-PC", position: { x: 650, y: 550 }, ip: "10.0.2.10", status: "active", connections: ["sw2"] },
];

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Labs Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const LABS = [
  // Ã¢â€â‚¬Ã¢â€â‚¬ ORIGINAL 4 LABS (unchanged) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    labId: "lab-1",
    name: "OSPF Troubleshooting",
    description: "Configure and troubleshoot OSPF routing protocol in a multi-area network",
    difficulty: "advanced",
    category: "Routing Protocols",
    module: "IP Connectivity",
    order: 1,
    estimatedTime: "45 min",
    objectives: [
      "Configure OSPF on all routers",
      "Establish neighbor relationships",
      "Verify routing table convergence",
      "Troubleshoot area mismatches",
      "Implement authentication",
    ],
    topology: [
      { nodeId: "r1", type: "router", name: "Router-1", position: { x: 100, y: 200 }, ip: "10.0.1.1", status: "active", connections: ["r2", "sw1"] },
      { nodeId: "r2", type: "router", name: "Router-2", position: { x: 400, y: 200 }, ip: "10.0.2.1", status: "active", connections: ["r1", "r3"] },
      { nodeId: "r3", type: "router", name: "Router-3", position: { x: 700, y: 200 }, ip: "10.0.3.1", status: "active", connections: ["r2", "sw2"] },
      { nodeId: "sw1", type: "switch", name: "Switch-1", position: { x: 100, y: 400 }, status: "active", connections: ["r1", "pc1"] },
      { nodeId: "sw2", type: "switch", name: "Switch-2", position: { x: 700, y: 400 }, status: "active", connections: ["r3", "pc2"] },
      { nodeId: "pc1", type: "pc", name: "PC-1", position: { x: 100, y: 550 }, ip: "192.168.1.10", status: "active", connections: ["sw1"] },
      { nodeId: "pc2", type: "pc", name: "PC-2", position: { x: 700, y: 550 }, ip: "192.168.2.10", status: "active", connections: ["sw2"] },
    ],
    commands: ["show ip ospf neighbor", "show ip route", "show ip ospf interface", "show ip ospf database", "show running-config"],
    objectiveCommands: [
      ["show ip ospf neighbor", "show ip ospf interface", "show running-config"],  // 0: Configure OSPF on all routers
      ["show ip ospf neighbor"],                                                    // 1: Establish neighbor relationships
      ["show ip route"],                                                            // 2: Verify routing table convergence
      ["show ip ospf database"],                                                    // 3: Troubleshoot area mismatches
      ["show running-config"],                                                      // 4: Implement authentication
    ],
    hints: ["Use 'router ospf 1' then 'network' to add interfaces to OSPF", "Neighbors must share the same area ID and hello/dead timers", "Use 'show ip ospf neighbor' — state should be FULL", "Area mismatch causes neighbor stuck in INIT state", "Use 'ip ospf authentication message-digest' on both sides"],
  },
  {
    labId: "lab-2",
    name: "VLAN Configuration",
    description: "Configure VLANs, trunk ports, and inter-VLAN routing",
    difficulty: "intermediate",
    category: "Switching",
    module: "Switching & VLANs",
    order: 2,
    estimatedTime: "30 min",
    objectives: [
      "Create VLANs 10, 20, and 30",
      "Configure access ports",
      "Configure trunk ports",
      "Set up inter-VLAN routing",
      "Verify connectivity",
    ],
    topology: [
      { nodeId: "r1", type: "router", name: "Router-1", position: { x: 400, y: 150 }, ip: "10.0.0.1", status: "active", connections: ["sw1"] },
      { nodeId: "sw1", type: "switch", name: "Core-Switch", position: { x: 400, y: 300 }, status: "active", connections: ["r1", "sw2", "sw3"] },
      { nodeId: "sw2", type: "switch", name: "Access-SW-1", position: { x: 200, y: 450 }, status: "active", connections: ["sw1", "pc1", "pc2"] },
      { nodeId: "sw3", type: "switch", name: "Access-SW-2", position: { x: 600, y: 450 }, status: "active", connections: ["sw1", "pc3", "pc4"] },
      { nodeId: "pc1", type: "pc", name: "PC-VLAN10-1", position: { x: 100, y: 600 }, ip: "192.168.10.10", status: "active", connections: ["sw2"] },
      { nodeId: "pc2", type: "pc", name: "PC-VLAN10-2", position: { x: 300, y: 600 }, ip: "192.168.10.11", status: "active", connections: ["sw2"] },
      { nodeId: "pc3", type: "pc", name: "PC-VLAN20-1", position: { x: 500, y: 600 }, ip: "192.168.20.10", status: "active", connections: ["sw3"] },
      { nodeId: "pc4", type: "pc", name: "PC-VLAN20-2", position: { x: 700, y: 600 }, ip: "192.168.20.11", status: "active", connections: ["sw3"] },
    ],
    commands: ["show vlan brief", "show interfaces trunk", "show ip interface brief", "show ip route", "show running-config"],
    objectiveCommands: [
      ["show vlan brief"],                                   // 0: Create VLANs 10, 20, and 30
      ["show ip interface brief"],                           // 1: Configure access ports
      ["show interfaces trunk"],                             // 2: Configure trunk ports
      ["show ip route"],                                     // 3: Set up inter-VLAN routing
      ["show running-config"],                               // 4: Verify connectivity
    ],
    hints: ["Use 'vlan 10' in global config to create VLAN, 'name Engineering' to name it", "Assign access ports with 'switchport mode access' and 'switchport access vlan 10'", "Configure trunk with 'switchport mode trunk' — allows all VLANs", "Inter-VLAN routing needs a Layer 3 device (router-on-a-stick or SVI)", "Verify with 'show vlan brief' and 'ping' between VLANs"],
  },
  {
    labId: "lab-3",
    name: "ACL Security Setup",
    description: "Implement access control lists to secure network traffic",
    difficulty: "intermediate",
    category: "Security",
    module: "Security Fundamentals",
    order: 3,
    estimatedTime: "35 min",
    objectives: [
      "Create standard ACL",
      "Create extended ACL",
      "Apply ACL to interfaces",
      "Test traffic filtering",
      "Verify security policy",
    ],
    topology: [
      { nodeId: "r1", type: "router", name: "Edge-Router", position: { x: 400, y: 200 }, ip: "203.0.113.1", status: "active", connections: ["cloud", "sw1"] },
      { nodeId: "cloud", type: "cloud", name: "Internet", position: { x: 400, y: 50 }, status: "active", connections: ["r1"] },
      { nodeId: "sw1", type: "switch", name: "Internal-SW", position: { x: 400, y: 400 }, status: "active", connections: ["r1", "pc1", "srv1"] },
      { nodeId: "pc1", type: "pc", name: "User-PC", position: { x: 200, y: 550 }, ip: "192.168.1.100", status: "active", connections: ["sw1"] },
      { nodeId: "srv1", type: "server", name: "Web-Server", position: { x: 600, y: 550 }, ip: "192.168.1.10", status: "active", connections: ["sw1"] },
    ],
    commands: ["show access-lists", "show ip interface", "show ip access-lists", "ping 192.168.1.10", "show running-config"],
    objectiveCommands: [
      ["show access-lists"],                                 // 0: Create standard ACL
      ["show ip access-lists"],                              // 1: Create extended ACL
      ["show ip interface"],                                 // 2: Apply ACL to interfaces
      ["ping 192.168.1.10", "ping"],                         // 3: Test traffic filtering
      ["show running-config"],                               // 4: Verify security policy
    ],
    hints: ["Standard ACLs filter by source IP only — use 'access-list 10 permit 192.168.1.0 0.0.0.255'", "Extended ACLs can filter by source, destination, and protocol/port", "Apply with 'ip access-group <name> in/out' on the interface", "Ping to test — if filtered, you'll get 'Destination unreachable'", "ACLs have implicit 'deny any' at end — add explicit permit if needed"],
  },
  {
    labId: "lab-4",
    name: "BGP Routing Protocol",
    description: "Configure and verify BGP peering between autonomous systems",
    difficulty: "advanced",
    category: "Routing Protocols",
    module: "IP Connectivity",
    order: 4,
    estimatedTime: "60 min",
    objectives: [
      "Configure eBGP peering",
      "Configure iBGP peering",
      "Advertise networks",
      "Verify BGP neighbor states",
      "Implement route filtering",
    ],
    topology: [
      { nodeId: "r1", type: "router", name: "AS100-R1", position: { x: 150, y: 200 }, ip: "10.1.1.1", status: "active", connections: ["r2", "pc1"] },
      { nodeId: "r2", type: "router", name: "AS100-R2", position: { x: 400, y: 200 }, ip: "10.1.1.2", status: "active", connections: ["r1", "r3"] },
      { nodeId: "r3", type: "router", name: "AS200-R1", position: { x: 650, y: 200 }, ip: "10.2.1.1", status: "active", connections: ["r2", "pc2"] },
      { nodeId: "pc1", type: "pc", name: "Network-A", position: { x: 150, y: 400 }, ip: "192.168.100.1", status: "active", connections: ["r1"] },
      { nodeId: "pc2", type: "pc", name: "Network-B", position: { x: 650, y: 400 }, ip: "192.168.200.1", status: "active", connections: ["r3"] },
    ],
    commands: ["show ip bgp summary", "show ip bgp neighbors", "show ip bgp", "show running-config | section bgp", "show ip route"],
    objectiveCommands: [
      ["show ip bgp summary"],                               // 0: Configure eBGP peering
      ["show ip bgp neighbors"],                             // 1: Configure iBGP peering
      ["show ip bgp"],                                       // 2: Advertise networks
      ["show ip bgp summary", "show ip bgp neighbors"],      // 3: Verify BGP neighbor states
      ["show running-config | section bgp", "show ip route"], // 4: Implement route filtering
    ],
    hints: ["eBGP peers have different AS numbers — use 'neighbor x.x.x.x remote-as <different-AS>'", "iBGP peers share the same AS — use 'neighbor x.x.x.x remote-as <same-AS>'", "Advertise with 'network x.x.x.x mask y.y.y.y' — the route must exist in routing table", "BGP state should show 'Established' in show ip bgp summary", "Use route-maps and prefix-lists for filtering: 'neighbor x.x.x.x route-map FILTER in'"],
  },
  { labId:"lab-m1-1", name:"OSI & TCP/IP Model Identification", description:"Identify each OSI layer by function, map TCP/IP layers to OSI, and use show commands to identify layer-specific information on a Cisco device.", difficulty:"beginner", category:"Network Fundamentals", module:"Network Fundamentals", order:5, estimatedTime:"20 min", objectives:["Identify all 7 OSI layers and their primary functions","Map TCP/IP layers to corresponding OSI layers","Use show version to identify device hardware (Layer 1)","Use show interfaces to view Layer 2 MAC addresses and encapsulation","Use show arp to view Layer 3 address mappings"], topology:defaultTopology, commands:["show version","show interfaces","show ip interface brief","show arp","show mac address-table"], hints:["Layer 1 = Physical, Layer 2 = Data Link, Layer 3 = Network","show arp maps IP (L3) to MAC (L2) addresses"], objectiveCommands:[["show version"],["show ip interface brief"],["show version"],["show interfaces"],["show arp"]] },
  { labId:"lab-m1-2", name:"IPv4 Addressing & Subnetting", description:"Calculate network and broadcast addresses, create subnets using VLSM, assign IP addresses to interfaces, and verify with show commands.", difficulty:"beginner", category:"Network Fundamentals", module:"Network Fundamentals", order:6, estimatedTime:"35 min", objectives:["Calculate network address, broadcast address, and valid host range for a /24 subnet","Apply VLSM to divide 192.168.1.0/24 into 4 subnets of different sizes","Assign IP addresses to router interfaces using ip address command","Bring interfaces up with no shutdown","Verify IP assignments with show ip interface brief"], topology:defaultTopology, commands:["show ip interface brief","show interfaces","ip address 192.168.1.1 255.255.255.0","no shutdown","show ip interface brief"], hints:["Network address = IP AND mask","Broadcast = last address in subnet","VLSM: size subnets from largest to smallest"], objectiveCommands:[["show ip interface brief"],["show interfaces"],["ip address"],["no shutdown"],["show ip interface brief"]] },
  { labId:"lab-m1-3", name:"IPv6 Addressing & Configuration", description:"Configure global unicast, link-local, and loopback IPv6 addresses, enable IPv6 routing, and verify neighbor discovery.", difficulty:"beginner", category:"Network Fundamentals", module:"Network Fundamentals", order:7, estimatedTime:"30 min", objectives:["Configure a global unicast IPv6 address (2001:DB8::/32 range) on an interface","Enable IPv6 on an interface with ipv6 enable (generates link-local automatically)","Enable IPv6 routing with ipv6 unicast-routing","Verify IPv6 addresses with show ipv6 interface brief","Verify neighbor discovery with show ipv6 neighbors"], topology:defaultTopology, commands:["ipv6 address 2001:DB8:1::1/64","ipv6 enable","ipv6 unicast-routing","show ipv6 interface brief","show ipv6 neighbors"], hints:["Link-local addresses start with FE80::","EUI-64 uses MAC address to generate interface ID"], objectiveCommands:[["ipv6 address"],["ipv6 enable"],["ipv6 unicast-routing"],["show ipv6 interface brief"],["show ipv6 neighbors"]] },
  { labId:"lab-m1-4", name:"Cisco IOS Navigation & Basic Config", description:"Navigate exec/config/interface modes, set hostname, banner, and passwords, save configuration, and use the IOS help system.", difficulty:"beginner", category:"Network Fundamentals", module:"Network Fundamentals", order:8, estimatedTime:"25 min", objectives:["Enter privileged exec mode with enable","Enter global configuration mode with configure terminal","Set device hostname","Configure enable secret password","Enable service password-encryption","Configure a MOTD banner","Save configuration with copy running-config startup-config"], topology:defaultTopology, commands:["enable","configure terminal","hostname SmartRouter","enable secret Cisco123","service password-encryption","banner motd #Authorized Access Only#","copy running-config startup-config"], hints:["User EXEC mode prompt: Router>","Privileged EXEC: Router#","Global config: Router(config)#"], objectiveCommands:[["enable"],["configure terminal","conf t"],["hostname"],["enable secret"],["service password-encryption"],["banner motd"],["copy running-config startup-config","copy run start","wr"]] },
  {
    labId: "lab-m1-5",
    name: "Cable Types & Physical Layer",
    description: "Identify the correct cable type for each network scenario and verify interface status reflects physical connectivity using CDP.",
    difficulty: "beginner",
    category: "Network Fundamentals",
    module: "Network Fundamentals",
    order: 9,
    estimatedTime: "20 min",
    objectives: [
      "Identify when to use straight-through vs crossover cables",
      "Understand rollover (console) cable usage",
      "Verify interface physical status with show interfaces status",
      "Discover directly connected neighbors with show cdp neighbors",
      "View detailed neighbor information including platform and IP",
    ],
    topology: defaultTopology,
    commands: ["show interfaces status", "show cdp neighbors", "show cdp neighbors detail", "show interfaces status", "show cdp neighbors detail"],
    objectiveCommands: [["show interfaces status"],["show interfaces status"],["show interfaces status"],["show cdp neighbors"],["show cdp neighbors detail"]],
    hints: ["Straight-through: different device types (PC to switch)", "Crossover: same device types (switch to switch)", "Modern switches use Auto-MDIX Ã¢â‚¬â€ cable type less critical"],
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ MODULE 2 Ã¢â‚¬â€ Switching & VLANs Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    labId: "lab-m2-1",
    name: "STP (Spanning Tree Protocol)",
    description: "Identify the root bridge, understand STP port states, manipulate root bridge election with priority, and verify the spanning tree topology.",
    difficulty: "intermediate",
    category: "Switching & VLANs",
    module: "Switching & VLANs",
    order: 10,
    estimatedTime: "40 min",
    objectives: [
      "Identify the current root bridge using show spanning-tree",
      "Understand port states: blocking, listening, learning, forwarding",
      "Change root bridge by lowering priority with spanning-tree vlan 1 priority 4096",
      "Enable PortFast on access ports",
      "Verify topology change with show spanning-tree detail",
    ],
    topology: switchTopology,
    commands: ["show spanning-tree", "show spanning-tree vlan 1", "spanning-tree vlan 1 priority 4096", "spanning-tree portfast", "show spanning-tree detail"],
    objectiveCommands: [["show spanning-tree"],["show spanning-tree vlan 1","show spanning-tree vlan"],["spanning-tree vlan 1 priority","spanning-tree vlan"],["spanning-tree portfast","portfast"],["show spanning-tree detail"]],
    hints: ["Lowest bridge priority wins root election", "Default priority is 32768", "PortFast skips listening/learning states"],
  },
  {
    labId: "lab-m2-2",
    name: "EtherChannel (LACP & PAgP)",
    description: "Bundle physical links into a logical EtherChannel using LACP and PAgP, and verify load balancing across the bundle.",
    difficulty: "intermediate",
    category: "Switching & VLANs",
    module: "Switching & VLANs",
    order: 11,
    estimatedTime: "35 min",
    objectives: [
      "Configure LACP EtherChannel with channel-group mode active on both ends",
      "Configure PAgP EtherChannel with channel-group mode desirable",
      "Verify bundle status with show etherchannel summary",
      "Check port-channel details with show etherchannel port-channel",
      "Verify load balancing method",
    ],
    topology: switchTopology,
    commands: ["channel-group 1 mode active", "channel-group 2 mode desirable", "show etherchannel summary", "show etherchannel port-channel", "show etherchannel summary"],
    objectiveCommands: [["channel-group 1 mode active","channel-group mode active"],["channel-group 2 mode desirable","channel-group mode desirable"],["show etherchannel summary"],["show etherchannel port-channel"],["show etherchannel summary","show etherchannel"]],
    hints: ["LACP: active/active or active/passive", "PAgP: desirable/desirable or desirable/auto", "Both ends must use compatible modes"],
  },
  {
    labId: "lab-m2-3",
    name: "Inter-VLAN Routing (Router-on-a-Stick)",
    description: "Configure subinterfaces with 802.1Q encapsulation on a router to enable routing between VLANs using a single physical link.",
    difficulty: "intermediate",
    category: "Switching & VLANs",
    module: "Switching & VLANs",
    order: 12,
    estimatedTime: "40 min",
    objectives: [
      "Configure trunk port on switch toward router",
      "Create subinterface Gi0/0.10 with encapsulation dot1q 10",
      "Create subinterface Gi0/0.20 with encapsulation dot1q 20",
      "Assign gateway IPs to each subinterface",
      "Verify inter-VLAN routing with show ip route",
    ],
    topology: [
      { nodeId: "r1", type: "router", name: "Router-1", position: { x: 400, y: 150 }, ip: "192.168.10.1", status: "active", connections: ["sw1"] },
      { nodeId: "sw1", type: "switch", name: "Core-Switch", position: { x: 400, y: 300 }, status: "active", connections: ["r1", "pc1", "pc2"] },
      { nodeId: "pc1", type: "pc", name: "VLAN10-PC", position: { x: 200, y: 500 }, ip: "192.168.10.10", status: "active", connections: ["sw1"] },
      { nodeId: "pc2", type: "pc", name: "VLAN20-PC", position: { x: 600, y: 500 }, ip: "192.168.20.10", status: "active", connections: ["sw1"] },
    ],
    commands: ["switchport mode trunk", "interface GigabitEthernet0/0.10", "encapsulation dot1q 10", "encapsulation dot1q 20", "show ip route"],
    objectiveCommands: [["switchport mode trunk","show interfaces trunk"],["interface gigabitethernet0/0.10","interface gi0/0.10"],["encapsulation dot1q 10"],["encapsulation dot1q 20","ip address 192.168.20"],["show ip route"]],
    hints: ["Subinterface number typically matches VLAN ID", "Native VLAN subinterface uses encapsulation dot1q [id] native"],
  },
  {
    labId: "lab-m2-4",
    name: "VLAN Trunking Protocol (VTP)",
    description: "Configure VTP server, client, and transparent modes, verify VLAN propagation across switches, and understand VTP pruning risks.",
    difficulty: "intermediate",
    category: "Switching & VLANs",
    module: "Switching & VLANs",
    order: 13,
    estimatedTime: "30 min",
    objectives: [
      "Configure VTP domain name on all switches",
      "Set one switch as VTP server",
      "Set remaining switches as VTP clients",
      "Create VLANs on server and verify propagation to clients",
      "Verify VTP status with show vtp status",
    ],
    topology: switchTopology,
    commands: ["vtp domain SMARTLAB", "vtp mode server", "vtp mode client", "vtp password Cisco123", "show vtp status"],
    objectiveCommands: [["vtp domain"],["vtp mode server"],["vtp mode client"],["vtp password","vlan "],["show vtp status"]],
    hints: ["VTP transparent mode does not participate in VTP but forwards VTP advertisements", "Higher revision number wins Ã¢â‚¬â€ be careful adding old switches"],
  },
  {
    labId: "lab-m2-5",
    name: "Port Security",
    description: "Enable port security on switch access ports, set maximum MAC addresses, configure violation modes, and verify and recover from violations.",
    difficulty: "intermediate",
    category: "Switching & VLANs",
    module: "Switching & VLANs",
    order: 14,
    estimatedTime: "30 min",
    objectives: [
      "Enable port security on an access port",
      "Set maximum MAC addresses to 2",
      "Configure violation mode to restrict",
      "Configure sticky MAC learning",
      "Verify with show port-security and show port-security interface",
    ],
    topology: switchTopology,
    commands: ["switchport port-security", "switchport port-security maximum 2", "switchport port-security violation restrict", "switchport port-security mac-address sticky", "show port-security"],
    objectiveCommands: [["switchport port-security"],["switchport port-security maximum 2","port-security maximum"],["switchport port-security violation restrict","port-security violation"],["switchport port-security mac-address sticky","port-security mac-address sticky"],["show port-security"]],
    hints: ["Shutdown mode: port goes err-disabled on violation", "Restrict mode: drops frames, increments counter", "Protect mode: drops frames silently"],
  },
  {
    labId: "lab-m2-6",
    name: "Layer 3 Switching (SVI)",
    description: "Create Switched Virtual Interfaces (SVIs) for inter-VLAN routing on a multilayer switch, enable IP routing, and compare to router-on-a-stick.",
    difficulty: "intermediate",
    category: "Switching & VLANs",
    module: "Switching & VLANs",
    order: 15,
    estimatedTime: "35 min",
    objectives: [
      "Enable ip routing on the multilayer switch",
      "Create SVI for VLAN 10 with interface vlan 10",
      "Assign gateway IP to each SVI",
      "Verify SVIs are up with show interfaces vlan",
      "Verify routing table includes VLAN subnets",
    ],
    topology: switchTopology,
    commands: ["ip routing", "interface vlan 10", "ip address 192.168.10.1 255.255.255.0", "show interfaces vlan 10", "show ip route"],
    objectiveCommands: [["ip routing"],["interface vlan 10","interface vlan"],["ip address 192.168.10.1","ip address 192.168."],["show interfaces vlan"],["show ip route"]],
    hints: ["SVI is up only when at least one port in the VLAN is active", "Layer 3 switching is faster than router-on-a-stick for high traffic"],
  },

  // â”€â”€ MODULE 3 â€” IP Connectivity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { labId:"lab-m3-1", name:"Static Routing", description:"Configure static routes, default route, floating static, and verify the routing table.", difficulty:"intermediate", category:"IP Connectivity", module:"IP Connectivity", order:16, estimatedTime:"30 min", topology:defaultTopology, objectives:["Configure a static route to a remote network","Configure a default route (0.0.0.0/0)","Configure a floating static route with higher AD","Verify routes with show ip route","Remove a route with no ip route"], commands:["ip route 192.168.2.0 255.255.255.0 10.0.1.2","ip route 0.0.0.0 0.0.0.0 10.0.1.254","ip route 192.168.2.0 255.255.255.0 10.0.1.2 200","show ip route","show ip route static"], objectiveCommands:[["ip route 192.168.2.0","ip route"],["ip route 0.0.0.0"],["ip route 192.168.2.0 255.255.255.0 10.0.1.2 200","ip route 0.0.0.0 0.0.0.0"],["show ip route"],["show ip route static","show ip route"]], hints:["Default route AD is 1","Floating static uses AD > 1 to act as backup"] },
  { labId:"lab-m3-2", name:"OSPF Single Area", description:"Enable OSPF process, configure router-id, advertise networks, and verify neighbor adjacency.", difficulty:"intermediate", category:"IP Connectivity", module:"IP Connectivity", order:17, estimatedTime:"45 min", topology:defaultTopology, objectives:["Enable OSPF with router ospf 1","Set router-id to loopback address","Advertise all networks into area 0","Verify neighbor state is FULL","Check OSPF routes in routing table"], commands:["router ospf 1","router-id 10.0.1.1","network 10.0.0.0 0.255.255.255 area 0","show ip ospf neighbor","show ip route ospf"], objectiveCommands:[["router ospf 1","router ospf"],["router-id"],["network 10.0.0.0","network "],["show ip ospf neighbor"],["show ip route ospf"]], hints:["Router-ID is highest loopback or highest active interface IP","FULL/DR means this router is the DR neighbor"] },
  { labId:"lab-m3-3", name:"OSPF Multi-Area", description:"Configure ABR, understand LSA types, summarize routes between areas, and verify inter-area routing.", difficulty:"intermediate", category:"IP Connectivity", module:"IP Connectivity", order:18, estimatedTime:"50 min", topology:defaultTopology, objectives:["Configure Area 0 backbone and Area 1","Set up ABR connecting both areas","Configure route summarization on ABR","Verify inter-area routes (O IA) in table","Verify ABR with show ip ospf border-routers"], commands:["network 10.0.0.0 0.255.255.255 area 0","area 1 range 192.168.0.0 255.255.0.0","show ip route ospf","show ip ospf database summary","show ip ospf border-routers"], objectiveCommands:[["network ","area 0"],["area 1","area 1 range"],["area 1 range","area range"],["show ip route ospf"],["show ip ospf border-routers"]], hints:["ABR has interfaces in multiple OSPF areas","Type 3 LSAs carry inter-area summary routes"] },
  { labId:"lab-m3-4", name:"EIGRP Configuration", description:"Enable EIGRP, configure AS number, advertise networks, and verify DUAL algorithm output.", difficulty:"intermediate", category:"IP Connectivity", module:"IP Connectivity", order:19, estimatedTime:"45 min", topology:defaultTopology, objectives:["Enable EIGRP with autonomous system 100","Advertise connected networks","Verify neighbor adjacencies","Examine DUAL topology table","Check EIGRP routes in routing table"], commands:["router eigrp 100","network 10.0.0.0 0.255.255.255","show ip eigrp neighbors","show ip eigrp topology","show ip route eigrp"], objectiveCommands:[["router eigrp 100","router eigrp"],["network "],["show ip eigrp neighbors"],["show ip eigrp topology"],["show ip route eigrp"]], hints:["EIGRP uses DUAL algorithm â€” successor is best path","Feasible successor is the backup path"] },
  { labId:"lab-m3-5", name:"Route Redistribution", description:"Redistribute static routes into OSPF and OSPF into EIGRP, set metric values, and verify.", difficulty:"intermediate", category:"IP Connectivity", module:"IP Connectivity", order:20, estimatedTime:"40 min", topology:defaultTopology, objectives:["Redistribute static routes into OSPF","Redistribute OSPF into EIGRP with metric","Verify external routes appear in table","Check OSPF external LSAs","Avoid redistribution loops with route tags"], commands:["redistribute static subnets","redistribute ospf 1 metric 10000 100 255 1 1500","show ip route","show ip ospf database external","show ip route ospf"], objectiveCommands:[["redistribute static"],["redistribute ospf","redistribute eigrp"],["show ip route"],["show ip ospf database external"],["show ip route ospf","show ip route"]], hints:["OSPF external type E2 is default â€” cost does not accumulate","Use route-map to filter during redistribution"] },
  { labId:"lab-m3-6", name:"HSRP Configuration", description:"Configure HSRP active/standby routers, set priority and preemption, and verify failover.", difficulty:"intermediate", category:"IP Connectivity", module:"IP Connectivity", order:21, estimatedTime:"35 min", topology:defaultTopology, objectives:["Configure HSRP group 1 with virtual IP","Set active router priority to 110","Enable preemption on active router","Configure standby router with priority 90","Verify with show standby brief"], commands:["standby 1 ip 192.168.1.1","standby 1 priority 110","standby 1 preempt","standby 1 priority 90","show standby","show standby brief"], objectiveCommands:[["standby 1 ip","standby ip"],["standby 1 priority 110","standby priority"],["standby 1 preempt","standby preempt"],["standby 1 priority 90","standby priority 90"],["show standby brief"]], hints:["Highest priority wins active role","Preempt allows router to reclaim active role after recovery"] },

  // â”€â”€ MODULE 4 â€” IP Services â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { labId:"lab-m4-1", name:"NAT & PAT Configuration", description:"Configure static NAT, dynamic NAT with pool, and PAT overload, then verify translations.", difficulty:"intermediate", category:"IP Services", module:"IP Services", order:22, estimatedTime:"40 min", topology:wanTopology, objectives:["Configure static NAT for a server","Create a NAT pool for dynamic NAT","Configure PAT with ip nat inside source list overload","Mark inside and outside interfaces","Verify with show ip nat translations"], commands:["ip nat inside source static 192.168.1.10 203.0.113.20","ip nat pool INET 203.0.113.10 203.0.113.17 netmask 255.255.255.248","ip nat inside source list 1 pool INET overload","show ip nat translations","show ip nat statistics"], objectiveCommands:[["ip nat inside source static"],["ip nat pool"],["ip nat inside source list","overload"],["ip nat inside","ip nat outside"],["show ip nat translations"]], hints:["PAT overload maps many inside locals to one global IP using port numbers","clear ip nat translation * resets all dynamic entries"] },
  { labId:"lab-m4-2", name:"DHCP Server Configuration", description:"Configure a DHCP pool, set excluded addresses, configure relay agent, and verify leases.", difficulty:"intermediate", category:"IP Services", module:"IP Services", order:23, estimatedTime:"35 min", topology:defaultTopology, objectives:["Exclude router gateway addresses from pool","Configure DHCP pool with network and default-router","Add DNS server to pool","Configure ip helper-address for relay","Verify leases with show ip dhcp binding"], commands:["ip dhcp excluded-address 192.168.1.1 192.168.1.10","ip dhcp pool LAN_POOL","network 192.168.1.0 255.255.255.0","default-router 192.168.1.1","ip helper-address 10.0.1.1","show ip dhcp binding","show ip dhcp pool"], objectiveCommands:[["ip dhcp excluded-address"],["ip dhcp pool"],["network 192.168.1.0"],["default-router"],["ip helper-address"]], hints:["ip helper-address forwards DHCP broadcasts as unicast to server","Excluded addresses must be configured before the pool"] },
  { labId:"lab-m4-3", name:"NTP Configuration", description:"Configure NTP master and client, set timezone, and verify time synchronization.", difficulty:"intermediate", category:"IP Services", module:"IP Services", order:24, estimatedTime:"25 min", topology:defaultTopology, objectives:["Configure one router as NTP master stratum 2","Point client routers to NTP server","Set timezone to UTC","Verify sync with show ntp status","Check associations with show ntp associations"], commands:["ntp master 2","ntp server 10.0.1.1","clock timezone UTC 0","show ntp status","show ntp associations","show clock"], objectiveCommands:[["ntp master 2","ntp master"],["ntp server"],["clock timezone"],["show ntp status"],["show ntp associations"]], hints:["Stratum 1 is atomic clock â€” stratum 2 is one hop away","NTP sync can take a few minutes"] },
  { labId:"lab-m4-4", name:"SNMP Configuration", description:"Configure SNMPv2c community strings, SNMPv3 with auth, and SNMP traps.", difficulty:"intermediate", category:"IP Services", module:"IP Services", order:25, estimatedTime:"30 min", topology:defaultTopology, objectives:["Configure read-only SNMPv2c community string","Configure read-write community string","Set SNMP trap destination host","Enable interface up/down traps","Verify with show snmp"], commands:["snmp-server community public RO","snmp-server community private RW","snmp-server host 10.0.1.100 version 2c public","snmp-server enable traps","show snmp","show snmp community"], objectiveCommands:[["snmp-server community public ro","snmp-server community"],["snmp-server community private rw"],["snmp-server host"],["snmp-server enable traps"],["show snmp"]], hints:["RO = read-only, RW = read-write","SNMPv3 adds authentication and encryption over v2c"] },
  { labId:"lab-m4-5", name:"Syslog & NetFlow", description:"Configure syslog to a remote server, set logging levels, enable NetFlow, and verify exports.", difficulty:"intermediate", category:"IP Services", module:"IP Services", order:26, estimatedTime:"30 min", topology:defaultTopology, objectives:["Configure syslog server destination","Set logging trap level to informational","Enable NetFlow ingress on WAN interface","Configure NetFlow export to collector","Verify logs with show logging"], commands:["logging host 10.0.1.100","logging trap informational","ip flow ingress","ip flow-export destination 10.0.1.100 9996","show logging","show ip cache flow"], objectiveCommands:[["logging host"],["logging trap informational","logging trap"],["ip flow ingress"],["ip flow-export destination"],["show logging"]], hints:["Syslog levels 0-7: 0=emergencies, 7=debugging","NetFlow captures 5-tuple: src/dst IP, src/dst port, protocol"] },

  // â”€â”€ MODULE 5 â€” Security Fundamentals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { labId:"lab-m5-1", name:"Extended ACLs", description:"Create named and numbered extended ACLs, filter by IP/port/protocol, apply inbound and outbound, verify.", difficulty:"intermediate", category:"Security Fundamentals", module:"Security Fundamentals", order:27, estimatedTime:"40 min", topology:defaultTopology, objectives:["Create numbered extended ACL 100 permitting HTTP","Create named extended ACL denying Telnet","Apply ACL inbound on outside interface","Apply ACL outbound on inside interface","Verify matches with show ip access-lists"], commands:["ip access-list extended BLOCK_TELNET","deny tcp any any eq 23 log","permit ip any any","ip access-group BLOCK_TELNET in","show ip access-lists"], objectiveCommands:[["ip access-list extended","access-list 100"],["deny tcp any any eq 23","deny tcp"],["ip access-group block_telnet in","ip access-group"],["ip access-group block_telnet out","ip access-group"],["show ip access-lists"]], hints:["Extended ACLs should be applied closest to the source","Implicit deny any any at end of every ACL"] },
  { labId:"lab-m5-2", name:"AAA & RADIUS", description:"Configure local AAA, integrate RADIUS server, and set authentication/authorization/accounting.", difficulty:"intermediate", category:"Security Fundamentals", module:"Security Fundamentals", order:28, estimatedTime:"35 min", topology:defaultTopology, objectives:["Enable AAA with aaa new-model","Configure local user database as fallback","Point to RADIUS server with radius-server host","Set login authentication to use RADIUS then local","Verify with show aaa servers"], commands:["aaa new-model","aaa authentication login default group radius local","radius-server host 10.0.1.200 auth-port 1812","show aaa servers","show aaa sessions"], objectiveCommands:[["aaa new-model"],["aaa authentication login default group radius local","aaa authentication"],["radius-server host","radius server"],["aaa authentication login default group radius local","aaa authentication"],["show aaa servers"]], hints:["aaa new-model immediately applies AAA â€” have local user ready","RADIUS uses UDP 1812 for auth, 1813 for accounting"] },
  { labId:"lab-m5-3", name:"Zone-Based Firewall", description:"Create security zones, zone-pairs, write policy-maps with inspect, and apply to interfaces.", difficulty:"intermediate", category:"Security Fundamentals", module:"Security Fundamentals", order:29, estimatedTime:"45 min", topology:defaultTopology, objectives:["Create INSIDE and OUTSIDE security zones","Define zone-pair from INSIDE to OUTSIDE","Create class-map matching HTTP traffic","Create policy-map with inspect action","Apply service-policy to zone-pair"], commands:["zone security INSIDE","zone-pair security IN-TO-OUT source INSIDE destination OUTSIDE","class-map type inspect match-any HTTP-TRAFFIC","policy-map type inspect INSPECT-POLICY","show policy-map type inspect zone-pair"], objectiveCommands:[["zone security inside","zone security outside","zone security"],["zone-pair security"],["class-map type inspect"],["policy-map type inspect"],["show policy-map type inspect zone-pair"]], hints:["ZBF allows stateful inspection â€” return traffic allowed automatically","class-default with drop blocks all unmatched traffic"] },
  { labId:"lab-m5-4", name:"SSH Hardening", description:"Disable Telnet, configure SSHv2 with RSA key, restrict VTY to SSH only, and verify.", difficulty:"intermediate", category:"Security Fundamentals", module:"Security Fundamentals", order:30, estimatedTime:"25 min", topology:defaultTopology, objectives:["Generate 2048-bit RSA key pair","Set SSH version to 2","Configure VTY lines to accept SSH only","Set SSH timeout to 60 seconds","Verify with show ip ssh"], commands:["crypto key generate rsa modulus 2048","ip ssh version 2","line vty 0 4","transport input ssh","ip ssh time-out 60","show ip ssh","show ssh"], objectiveCommands:[["crypto key generate rsa"],["ip ssh version 2"],["line vty 0 4","line vty"],["transport input ssh"],["ip ssh time-out 60","ip ssh timeout"]], hints:["hostname and ip domain-name must be set before generating RSA key","ip ssh version 2 requires modulus >= 768 bits"] },
  { labId:"lab-m5-5", name:"DHCP Snooping & DAI", description:"Enable DHCP snooping, mark trusted ports, enable Dynamic ARP Inspection, verify drops.", difficulty:"intermediate", category:"Security Fundamentals", module:"Security Fundamentals", order:31, estimatedTime:"35 min", topology:switchTopology, objectives:["Enable DHCP snooping globally","Enable snooping on VLANs 10 and 20","Mark uplink to router as trusted port","Enable DAI on VLANs 10 and 20","Verify with show ip dhcp snooping statistics"], commands:["ip dhcp snooping","ip dhcp snooping vlan 10,20","ip dhcp snooping trust","ip arp inspection vlan 10,20","show ip dhcp snooping statistics","show ip arp inspection"], objectiveCommands:[["ip dhcp snooping"],["ip dhcp snooping vlan"],["ip dhcp snooping trust"],["ip arp inspection vlan"],["show ip dhcp snooping statistics"]], hints:["DHCP snooping blocks rogue DHCP servers on untrusted ports","DAI uses snooping binding table to validate ARP packets"] },

  // â”€â”€ MODULE 6 â€” Automation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { labId:"lab-m6-1", name:"Cisco IOS REST API (RESTCONF)", description:"Understand RESTCONF structure, make simulated GET/PUT requests, and parse JSON responses.", difficulty:"advanced", category:"Automation", module:"Automation", order:32, estimatedTime:"40 min", topology:defaultTopology, objectives:["Understand RESTCONF URL structure (host/restconf/data/)","Simulate GET for interface configuration","Read JSON response and identify interface IP","Simulate PUT to change hostname","Verify change with show running-config | format json"], commands:["show running-config | format json","show ip interface brief","show version"], objectiveCommands:[["show running-config","show run","show version"],["show ip interface brief","show ip int brief"],["show ip interface brief","show running-config"],["show running-config","show version","hostname"],["show running-config | format json","show run"]], hints:["RESTCONF uses HTTP methods: GET=read, PUT=replace, PATCH=update","Content-Type must be application/yang-data+json"] },
  { labId:"lab-m6-2", name:"Python Netmiko Simulation", description:"Trace Netmiko script commands on the device side and predict output.", difficulty:"advanced", category:"Automation", module:"Automation", order:33, estimatedTime:"35 min", topology:defaultTopology, objectives:["Identify commands a Netmiko script would send","Predict show command output the script reads","Understand ConnectHandler parameters","Trace send_command vs send_config_set","Verify expected state matches script assertions"], commands:["show version","show ip interface brief","configure terminal","hostname NetmikoRouter","show running-config"], objectiveCommands:[["show version"],["show ip interface brief","show ip int brief"],["configure terminal","conf t"],["hostname"],["show running-config","show run"]], hints:["send_command sends exec-mode commands","send_config_set sends a list of config commands"] },
  { labId:"lab-m6-3", name:"Ansible Playbook Dry Run", description:"Read an Ansible IOS playbook, predict generated commands, and verify by running manually.", difficulty:"advanced", category:"Automation", module:"Automation", order:34, estimatedTime:"40 min", topology:defaultTopology, objectives:["Read Ansible playbook targeting Cisco IOS module","Identify each task and its generated command","Run equivalent commands manually on device","Compare actual output to playbook assertions","Understand idempotency in network automation"], commands:["show running-config","show ip interface brief","show ip route","show ip ospf neighbor"], objectiveCommands:[["show running-config","show run"],["show ip interface brief","show ip int brief"],["show ip route","show ip ospf neighbor"],["show ip route","show running-config"],["show ip ospf neighbor","show ip interface brief","show running-config"]], hints:["ios_config module maps to config terminal commands","ios_command module maps to exec show commands"] },
  { labId:"lab-m6-4", name:"Network Automation with EEM", description:"Configure EEM applets to trigger on syslog events, automate interface recovery, and log events.", difficulty:"advanced", category:"Automation", module:"Automation", order:35, estimatedTime:"35 min", topology:defaultTopology, objectives:["Create EEM applet triggered by interface-down syslog","Add action to bring interface back up","Add syslog action to log the recovery","Verify applet registered with show event manager policy registered","Check event history with show event manager history events"], commands:["event manager applet INTF_RECOVERY","event syslog pattern \"LINK-3-UPDOWN.*down\"","action 1.0 cli command \"enable\"","show event manager policy registered","show event manager history events"], objectiveCommands:[["event manager applet"],["event syslog pattern"],["action 1.0 cli command","action"],["show event manager policy registered"],["show event manager history events"]], hints:["EEM applets trigger on syslog, CLI, SNMP, timer, or interface events","Use action syslog to write custom messages to syslog"] },

  // â”€â”€ MODULE 7 â€” WAN & SD-WAN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { labId:"lab-m7-1", name:"GRE Tunnels", description:"Configure GRE tunnel interfaces, set source/destination, route traffic through tunnel, and verify.", difficulty:"advanced", category:"WAN & SD-WAN", module:"WAN & SD-WAN", order:36, estimatedTime:"40 min", topology:wanTopology, objectives:["Create Tunnel0 interface","Set tunnel source to physical WAN interface","Set tunnel destination to remote WAN IP","Assign private IP to tunnel interface","Verify tunnel is up with show interfaces tunnel"], commands:["interface tunnel 0","tunnel source GigabitEthernet0/0","tunnel destination 203.0.113.2","tunnel mode gre ip","ip address 172.16.0.1 255.255.255.252","show interfaces tunnel","show ip route"], objectiveCommands:[["interface tunnel 0","interface tunnel"],["tunnel source"],["tunnel destination"],["ip address 172.16.0.1","ip address"],["show interfaces tunnel"]], hints:["GRE adds 24 bytes overhead â€” adjust MTU if needed","Tunnel source must be reachable via routing table"] },
  { labId:"lab-m7-2", name:"IPsec Site-to-Site VPN", description:"Configure IKE Phase 1 policy, Phase 2 transform-set, crypto map, and apply to interface.", difficulty:"advanced", category:"WAN & SD-WAN", module:"WAN & SD-WAN", order:37, estimatedTime:"50 min", topology:wanTopology, objectives:["Configure IKE Phase 1 ISAKMP policy with AES-256","Configure Phase 2 IPsec transform-set","Create crypto ACL defining interesting traffic","Build crypto map and apply to WAN interface","Verify tunnels with show crypto isakmp sa"], commands:["crypto isakmp policy 10","crypto ipsec transform-set VPN_SET esp-aes 256 esp-sha-hmac","crypto map VPN_MAP 10 ipsec-isakmp","show crypto isakmp sa","show crypto ipsec sa"], objectiveCommands:[["crypto isakmp policy"],["crypto ipsec transform-set"],["crypto map"],["crypto map","ip access-list"],["show crypto isakmp sa"]], hints:["Both peers must have matching ISAKMP policies","QM_IDLE state in show crypto isakmp sa means Phase 1 is up"] },
  { labId:"lab-m7-3", name:"MPLS Basics", description:"Enable MPLS on interfaces, configure LDP, and verify label bindings and forwarding table.", difficulty:"advanced", category:"WAN & SD-WAN", module:"WAN & SD-WAN", order:38, estimatedTime:"45 min", topology:defaultTopology, objectives:["Enable MPLS IP on WAN interfaces","Verify LDP neighbor adjacency","Check label bindings in LIB","Verify MPLS forwarding table (LFIB)","Trace label-switched path with show mpls forwarding-table"], commands:["mpls ip","mpls label protocol ldp","show mpls interfaces","show mpls ldp neighbor","show mpls forwarding-table"], objectiveCommands:[["mpls ip"],["show mpls ldp neighbor","mpls label protocol ldp"],["show mpls ldp neighbor"],["show mpls interfaces","mpls ip"],["show mpls forwarding-table"]], hints:["MPLS requires CEF to be enabled (on by default)","LDP uses TCP port 646 for label distribution"] },
  { labId:"lab-m7-4", name:"SD-WAN Concepts (vEdge CLI)", description:"Understand SD-WAN overlay, configure simulated vEdge parameters, verify control connections.", difficulty:"advanced", category:"WAN & SD-WAN", module:"WAN & SD-WAN", order:39, estimatedTime:"40 min", topology:wanTopology, objectives:["Understand SD-WAN control plane components (vManage/vSmart/vBond)","Verify control connections to vSmart","Check BFD sessions for data plane liveness","Verify OMP peer relationships","Understand TLOC concept"], commands:["show sdwan control connections","show sdwan bfd sessions","show sdwan omp peers"], objectiveCommands:[["show sdwan control connections","show sdwan"],["show sdwan control connections"],["show sdwan bfd sessions"],["show sdwan omp peers"],["show sdwan bfd sessions","show sdwan omp peers","show sdwan"]], hints:["vBond is the orchestrator â€” first contact point for vEdge","BFD detects data-plane link failures in milliseconds"] },
  { labId:"lab-m7-5", name:"QoS Configuration", description:"Configure DSCP marking, policy-map with queuing, apply to WAN interface, and verify queue stats.", difficulty:"advanced", category:"WAN & SD-WAN", module:"WAN & SD-WAN", order:40, estimatedTime:"40 min", topology:wanTopology, objectives:["Create class-map matching DSCP EF (voice)","Create class-map matching DSCP AF41 (video)","Build policy-map with bandwidth guarantees","Apply service-policy outbound on WAN interface","Verify queue statistics with show policy-map interface"], commands:["class-map match-any VOICE","match dscp ef","class-map match-any VIDEO","match dscp af41","policy-map WAN_QOS","service-policy output WAN_QOS","show policy-map interface","show queue GigabitEthernet0/0"], objectiveCommands:[["class-map match-any voice","class-map"],["class-map match-any video","match dscp af41"],["policy-map"],["service-policy output"],["show policy-map interface"]], hints:["DSCP EF (46) = Expedited Forwarding for voice","LLQ gives strict priority â€” use for voice only"] },

  // â”€â”€ MODULE 8 â€” Troubleshooting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { labId:"lab-m8-1", name:"Layer 2 Troubleshooting", description:"Identify STP topology changes, find switching loop cause, fix misconfigured trunk ports.", difficulty:"advanced", category:"Troubleshooting", module:"Troubleshooting", order:41, estimatedTime:"45 min", topology:switchTopology, objectives:["Use show spanning-tree detail to find topology changes","Identify the non-root port that should be blocking","Fix trunk port native VLAN mismatch","Enable PortFast on access ports to reduce convergence","Verify stable topology after changes"], commands:["show spanning-tree detail","show interfaces trunk","show mac address-table","spanning-tree portfast","show spanning-tree vlan 1"], objectiveCommands:[["show spanning-tree detail"],["show spanning-tree detail","show spanning-tree"],["show interfaces trunk"],["spanning-tree portfast","portfast"],["show spanning-tree vlan 1","show spanning-tree"]], hints:["Frequent topology changes indicate a flapping port","Native VLAN mismatch causes CDP warning and STP issues"] },
  { labId:"lab-m8-2", name:"Layer 3 Routing Troubleshooting", description:"Diagnose missing routes, fix OSPF neighbor stuck in EXSTART, resolve redistribution loops.", difficulty:"advanced", category:"Troubleshooting", module:"Troubleshooting", order:42, estimatedTime:"50 min", topology:defaultTopology, objectives:["Use show ip route to identify missing networks","Check OSPF neighbor state and find stuck adjacency","Fix MTU mismatch causing EXSTART/EXCHANGE loop","Verify OSPF authentication configuration matches","Use debug ip ospf adj to trace adjacency formation"], commands:["show ip route","show ip ospf neighbor","show ip ospf interface","show ip ospf interface","debug ip ospf adj","show ip protocols"], objectiveCommands:[["show ip route"],["show ip ospf neighbor"],["show ip ospf interface","ip ospf mtu-ignore"],["show ip ospf interface","ip ospf authentication"],["debug ip ospf adj","debug ip ospf"],["show ip protocols","show ip ospf"]], hints:["EXSTART usually means MTU mismatch or duplicate router-ID","Check ip ospf mtu-ignore if MTUs differ across link"] },
  { labId:"lab-m8-3", name:"ACL Troubleshooting", description:"Find why traffic is dropped, identify implicit deny hits, fix ACL ordering, use log keyword.", difficulty:"advanced", category:"Troubleshooting", module:"Troubleshooting", order:43, estimatedTime:"40 min", topology:defaultTopology, objectives:["Use show ip access-lists to check match counters","Identify which ACE is dropping traffic","Fix ACL entry order (specific before general)","Add log keyword to catch unexpected drops","Verify fix with ping and counter reset"], commands:["show ip access-lists","show running-config | section access-list","debug ip packet","show interfaces GigabitEthernet0/0"], objectiveCommands:[["show ip access-lists","show access-lists"],["show ip access-lists","show running-config"],["show running-config","show ip access-lists"],["debug ip packet","log"],["show ip access-lists","show interfaces"]], hints:["ACLs are processed top-down â€” first match wins","clear ip access-list counters resets hit counts for testing"] },
  { labId:"lab-m8-4", name:"NAT Troubleshooting", description:"Diagnose why NAT translations fail, fix inside/outside interface errors, clear stale entries.", difficulty:"advanced", category:"Troubleshooting", module:"Troubleshooting", order:44, estimatedTime:"35 min", topology:wanTopology, objectives:["Verify inside/outside NAT interface designations","Check that ACL matches correct source networks","Use show ip nat translations to find created entries","Debug NAT with debug ip nat","Clear stale translations with clear ip nat translation *"], commands:["show ip nat translations","show ip nat statistics","debug ip nat","clear ip nat translation *"], objectiveCommands:[["show ip nat translations","show ip nat statistics"],["show ip nat statistics","show ip nat translations"],["show ip nat translations"],["debug ip nat"],["clear ip nat translation"]], hints:["Most NAT failures: missing ip nat inside/outside on interface","debug ip nat shows s=src->translated, d=dst->translated"] },
  { labId:"lab-m8-5", name:"DHCP Troubleshooting", description:"Diagnose DHCP scope exhaustion, fix relay agent misconfiguration, find rogue DHCP servers.", difficulty:"advanced", category:"Troubleshooting", module:"Troubleshooting", order:45, estimatedTime:"35 min", topology:defaultTopology, objectives:["Check pool utilization with show ip dhcp pool","Find conflicts with show ip dhcp conflict","Verify relay agent ip helper-address is correct","Use DHCP snooping to detect rogue servers","Debug with debug ip dhcp server events"], commands:["show ip dhcp binding","show ip dhcp conflict","show ip dhcp pool","debug ip dhcp server events"], objectiveCommands:[["show ip dhcp pool","show ip dhcp binding"],["show ip dhcp conflict"],["show ip dhcp binding","ip helper-address"],["show ip dhcp snooping","ip dhcp snooping","show ip dhcp binding"],["debug ip dhcp server events","debug ip dhcp"]], hints:["DHCP conflicts cause that IP to be withheld from pool","ip helper-address must point to server, not broadcast"] },
  { labId:"lab-m8-6", name:"Full Network Troubleshooting Scenario", description:"Capstone: diagnose and fix a broken multi-layer network using structured troubleshooting methodology.", difficulty:"advanced", category:"Troubleshooting", module:"Troubleshooting", order:46, estimatedTime:"60 min", topology:defaultTopology, objectives:["Verify physical layer â€” interface status up/up","Verify Layer 2 â€” VLANs, trunks, STP","Verify Layer 3 â€” routing table, OSPF neighbors","Check IP services â€” NAT translations, DHCP bindings","Verify security â€” ACL counters, no implicit drops"], commands:["show interfaces","show ip interface brief","show vlan brief","show ip route","show ip ospf neighbor","show ip nat translations","show ip access-lists"], objectiveCommands:[["show interfaces","show ip interface brief"],["show vlan brief","show interfaces trunk"],["show ip route","show ip ospf neighbor"],["show ip nat translations","show ip dhcp binding"],["show ip access-lists","show access-lists"]], hints:["Start with physical layer â€” check interface status","Verify VLAN configuration before routing","Check ACLs last â€” they often mask other issues"] },

]; // â”€â”€ end of LABS array â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€ Achievements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ACHIEVEMENTS = [
  { achievementId: "ach-1", name: "First Steps", description: "Complete your first lab", points: 10, category: "Lab Completion", tier: "bronze", maxProgress: 1, icon: "ðŸŽ¯" },
  { achievementId: "ach-2", name: "Speed Runner", description: "Complete a lab in under 10 minutes", points: 25, category: "Speed", tier: "silver", maxProgress: 1, icon: "âš¡" },
  { achievementId: "ach-3", name: "OSPF Expert", description: "Complete all OSPF labs with perfect score", points: 50, category: "Networking Skills", tier: "gold", maxProgress: 1, icon: "ðŸŒ" },
  { achievementId: "ach-4", name: "Lab Marathon", description: "Complete 10 labs", points: 100, category: "Lab Completion", tier: "silver", maxProgress: 10, icon: "ðŸƒ" },
  { achievementId: "ach-5", name: "Consistent Learner", description: "Complete labs 5 days in a row", points: 50, category: "Consistency", tier: "silver", maxProgress: 5, icon: "ðŸ“…" },
  { achievementId: "ach-6", name: "Network Architect", description: "Complete 25 labs", points: 200, category: "Lab Completion", tier: "platinum", maxProgress: 25, icon: "ðŸ—ï¸" },
  { achievementId: "ach-7", name: "BGP Master", description: "Complete all BGP labs successfully", points: 75, category: "Networking Skills", tier: "gold", maxProgress: 1, icon: "ðŸ”—" },
  { achievementId: "ach-8", name: "Automation Guru", description: "Complete all Automation labs", points: 100, category: "Automation", tier: "gold", maxProgress: 4, icon: "ðŸ¤–" },
  { achievementId: "ach-9", name: "Team Player", description: "Help 3 other students in the forum", points: 30, category: "Social", tier: "bronze", maxProgress: 3, icon: "ðŸ¤" },
  { achievementId: "ach-ccna-m1", name: "CCNA Module Complete", description: "Complete all labs in a CCNA module", points: 50, category: "CCNA", tier: "silver", maxProgress: 1, icon: "ðŸ“š" },
  { achievementId: "ach-ccna-m3", name: "Routing Master", description: "Complete all Module 3 IP Connectivity labs with 100% objectives", points: 150, category: "CCNA", tier: "gold", maxProgress: 6, icon: "ðŸ—ºï¸" },
  { achievementId: "ach-ccna-m5", name: "Security Champion", description: "Complete all Module 5 Security Fundamentals labs", points: 150, category: "CCNA", tier: "gold", maxProgress: 5, icon: "ðŸ”’" },
  { achievementId: "ach-ccna-ready", name: "CCNA Ready", description: "Complete all 40+ CCNA labs â€” you are ready for the exam!", points: 500, category: "CCNA", tier: "platinum", maxProgress: 40, icon: "ðŸŽ“" },
];

// ─── Default users to seed ───────────────────────────────────────
// Passwords meet the registration policy (8+ chars, at least one letter
// and one digit). Override via env vars in production. These accounts make
// it possible to log in immediately after seeding a fresh database.
const SEED_USERS = [
  {
    name: "Admin",
    email: (process.env.SEED_ADMIN_EMAIL || "admin@smartitlab.com").toLowerCase(),
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@1234",
    role: "admin",
    plan: "enterprise",
    emailVerified: true,
  },
  {
    name: "Demo Student",
    email: (process.env.SEED_STUDENT_EMAIL || "student@smartitlab.com").toLowerCase(),
    password: process.env.SEED_STUDENT_PASSWORD || "Student@1234",
    role: "student",
    plan: "free",
    emailVerified: true,
  },
];

// Seed users one-by-one so the pre-save hook hashes each password.
// (findOneAndUpdate would bypass the hashing hook, storing plain text.)
const seedUsers = async () => {
  for (const u of SEED_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User already exists, skipping: ${u.email}`);
      continue;
    }
    const user = await User.create(u);
    await UserSettings.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id },
      { upsert: true, new: true }
    );
    console.log(`Created ${u.role} user: ${u.email}`);
  }
};

// â”€â”€â”€ Seed runner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/smartitlab";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    for (const lab of LABS) {
      await Lab.findOneAndUpdate({ labId: lab.labId }, lab, { upsert: true, new: true });
    }
    console.log(`Seeded ${LABS.length} labs`);
    for (const ach of ACHIEVEMENTS) {
      await Achievement.findOneAndUpdate({ achievementId: ach.achievementId }, ach, { upsert: true, new: true });
    }
    console.log(`Seeded ${ACHIEVEMENTS.length} achievements`);
    await seedUsers();
    await mongoose.disconnect();
    console.log("Seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

// Export LABS for testing
export { LABS };

// Only run seeding when executed directly (not when imported as a module)
const isMain = process.argv[1] && (
  process.argv[1].endsWith('seed.js') ||
  process.argv[1].endsWith('seed')
);

if (isMain) {
  seedDatabase();
}
