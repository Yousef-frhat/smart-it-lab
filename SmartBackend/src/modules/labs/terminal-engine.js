/**
 * Terminal command engine — returns realistic Cisco IOS CLI output.
 * Covers the full CCNA 200-301 curriculum plus original OSPF/VLAN/ACL/BGP labs.
 */

const OUTPUTS = {

  // ── OSPF ──────────────────────────────────────────────────────
  "show ip ospf neighbor": () =>
`Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.2.1          1   FULL/DR         00:00:38    10.0.12.2       GigabitEthernet0/0
10.0.3.1          1   FULL/BDR        00:00:35    10.0.13.3       GigabitEthernet0/1`,

  "show ip ospf interface": () =>
`GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.0.1.1/24, Area 0, Attached via Network Statement
  Process ID 1, Router ID 10.0.1.1, Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 10.0.1.1, Interface address 10.0.1.1
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
  Neighbor Count is 1, Adjacent neighbor count is 1
    Adjacent with neighbor 10.0.2.1  (Designated Router)`,

  "show ip ospf database": () =>
`            OSPF Router with ID (10.0.1.1) (Process ID 1)

                Router Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum Link count
10.0.1.1        10.0.1.1        312         0x80000004 0x00A1B2 3
10.0.2.1        10.0.2.1        298         0x80000003 0x00C3D4 2
10.0.3.1        10.0.3.1        301         0x80000002 0x00E5F6 2

                Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
10.0.12.2       10.0.2.1        298         0x80000001 0x001234`,

  "show ip ospf database summary": () =>
`            OSPF Router with ID (10.0.1.1) (Process ID 1)

                Summary Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
10.0.0.0        10.0.1.1        145         0x80000001 0x00ABCD
192.168.0.0     10.0.1.1        145         0x80000001 0x00EF12`,

  "show ip ospf border-routers": () =>
`            OSPF Process 1 internal Routing Table

Codes: i - Intra-area route, I - Inter-area route

i 10.0.2.1 [10] via 10.0.12.2, GigabitEthernet0/0, ABR, Area 0, SPF 4
I 10.0.3.1 [20] via 10.0.12.2, GigabitEthernet0/0, ASBR, Area 1, SPF 4`,

  "show ip ospf database external": () =>
`            OSPF Router with ID (10.0.1.1) (Process ID 1)

                Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
0.0.0.0         10.0.3.1        89          0x80000001 0x00CAFE 0
172.16.0.0      10.0.3.1        89          0x80000001 0x00BABE 0`,

  "show ip route": () =>
`Codes: C - connected, S - static, O - OSPF, B - BGP, D - EIGRP
       EX - EIGRP external, R - RIP, i - IS-IS

Gateway of last resort is 10.0.1.254 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.1.254
O     10.0.2.0/24 [110/2] via 10.0.12.2, 00:05:23, GigabitEthernet0/0
C     10.0.12.0/24 is directly connected, GigabitEthernet0/0
O     10.0.3.0/24 [110/3] via 10.0.12.2, 00:05:23, GigabitEthernet0/0
C     10.0.1.0/24 is directly connected, GigabitEthernet0/2
D     172.16.0.0/16 [90/2172416] via 10.0.2.1, 00:03:11, GigabitEthernet0/1
C     192.168.1.0/24 is directly connected, GigabitEthernet0/2`,

  "show ip route static": () =>
`Codes: S - static

Gateway of last resort is 10.0.1.254 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.1.254
S     10.10.10.0/24 [1/0] via 10.0.1.1
S     172.16.0.0/16 [1/0] via 10.0.2.1
S     192.168.100.0/24 [200/0] via 10.0.3.1  (floating static, AD=200)`,

  "show ip route ospf": () =>
`Codes: O - OSPF, IA - OSPF inter area, E1 - OSPF external type 1, E2 - OSPF external type 2

O     10.0.2.0/24 [110/2] via 10.0.12.2, 00:05:23, GigabitEthernet0/0
O     10.0.3.0/24 [110/3] via 10.0.12.2, 00:05:23, GigabitEthernet0/0
O IA  192.168.50.0/24 [110/20] via 10.0.12.2, 00:02:11, GigabitEthernet0/0
O E2  0.0.0.0/0 [110/1] via 10.0.12.2, 00:01:05, GigabitEthernet0/0`,

  "show ip protocols": () =>
`*** IP Routing is NSF aware ***

Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 10.0.1.1
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Maximum path: 4
  Routing for Networks:
    10.0.0.0 0.255.255.255 area 0
  Routing Information Sources:
    Gateway         Distance      Last Update
    10.0.2.1             110      00:05:23
    10.0.3.1             110      00:05:21
  Distance: (default is 110)

Routing Protocol is "eigrp 100"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Default networks flagged in outgoing updates
  EIGRP-IPv4 Protocol for AS(100)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
    NSF-aware route hold timer is 240
    Router-ID: 10.0.1.1
    Topology : 0 (base)
      Active Timer: 3 min
      Distance: internal 90 external 170
      Maximum path: 4
      Maximum hopcount 100`,


  // ── VLAN / Switching ──────────────────────────────────────────
  "show vlan brief": () =>
`VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/1, Gi0/2, Gi0/3, Gi0/4
10   Engineering                      active    Gi0/5, Gi0/6
20   Sales                            active    Gi0/7, Gi0/8
30   Management                       active    Gi0/9
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`,

  "show interfaces trunk": () =>
`Port        Mode             Encapsulation  Status        Native vlan
Gi0/24      on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/24      1-4094

Port        Vlans allowed and active in management domain
Gi0/24      1,10,20,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/24      1,10,20,30`,

  "show mac address-table": () =>
`          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0050.7966.6800    DYNAMIC     Gi0/1
  10    0050.7966.6801    DYNAMIC     Gi0/5
  10    0050.7966.6802    DYNAMIC     Gi0/6
  20    0050.7966.6803    DYNAMIC     Gi0/7
  20    0050.7966.6804    DYNAMIC     Gi0/8
  30    0050.7966.6805    DYNAMIC     Gi0/9
Total Mac Addresses for this criterion: 6`,

  // ── STP ───────────────────────────────────────────────────────
  "show spanning-tree": () =>
`VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769
             Address     0050.7966.6800
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)
             Address     0050.7966.6800
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Desg FWD 4         128.1    P2p
Gi0/2               Desg FWD 4         128.2    P2p
Gi0/3               Desg FWD 4         128.3    P2p
Gi0/24              Desg FWD 4         128.24   P2p`,

  "show spanning-tree detail": () =>
`VLAN0001 is executing the ieee compatible Spanning Tree protocol
  Bridge Identifier has priority 32768, sysid 1, address 0050.7966.6800
  Configured hello time 2, max age 20, forward delay 15, transmit hold-count 6
  We are the root of the spanning tree
  Topology change flag not set, detected flag not set
  Number of topology changes 3 last change occurred 00:15:42 ago
          from GigabitEthernet0/1
  Times:  hold 1, topology change 35, notification 2
          hello 2, max age 20, forward delay 15
  Timers: hello 0, topology change 0, notification 0, aging 300

 Port 1 (GigabitEthernet0/1) of VLAN0001 is designated forwarding
   Port path cost 4, Port priority 128, Port Identifier 128.1.
   Designated root has priority 32769, address 0050.7966.6800
   Designated bridge has priority 32769, address 0050.7966.6800
   Designated port id is 128.1, designated path cost 0
   Timers: message age 0, forward delay 0, hold 0
   Number of transitions to forwarding state: 1
   Link type is point-to-point by default
   BPDU: sent 468, received 0`,

  // ── EtherChannel ─────────────────────────────────────────────
  "show etherchannel summary": () =>
`Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator

        M - not in use, minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port

Number of channel-groups in use: 2
Number of aggregators:           2

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi0/1(P)   Gi0/2(P)
2      Po2(SU)         PAgP      Gi0/3(P)   Gi0/4(P)`,

  "show etherchannel port-channel": () =>
`                Channel-group listing:
                ----------------------

Group: 1
----------
                Port-channels in the group:
                ---------------------------

Port-channel: Po1    (Primary Aggregator)

Age of the Port-channel   = 0d:02h:15m:33s
Logical slot/port   = 16/0          Number of ports = 2
HotStandBy port = null
Port state          = Port-channel Ag-Inuse
Protocol            =   LACP
Port security       = Disabled

Ports in the Port-channel:

Index   Load   Port     EC state        No of bits
------+------+------+------------------+-----------
  0     00     Gi0/1    Active             0
  0     00     Gi0/2    Active             0`,

  // ── VTP ───────────────────────────────────────────────────────
  "show vtp status": () =>
`VTP Version capable             : 1 to 3
VTP version running             : 2
VTP Domain Name                 : SMARTLAB
VTP Pruning Mode                : Disabled
VTP Traps Generation            : Disabled
Device ID                       : 0050.7966.6800
Configuration last modified by 0.0.0.0 at 3-1-93 00:00:00
Local updater ID is 10.0.1.1 on interface Gi0/24 (lowest numbered VLAN interface found)

Feature VLAN:
--------------
VTP Operating Mode                : Server
Maximum VLANs supported locally   : 1005
Number of existing VLANs          : 8
Configuration Revision            : 5
MD5 digest                        : 0x4A 0x3B 0x2C 0x1D 0x5E 0x6F 0x7A 0x8B`,

  "show vtp counters": () =>
`VTP statistics:
Summary advertisements received    : 12
Subset advertisements received     : 3
Request advertisements received    : 0
Summary advertisements transmitted : 45
Subset advertisements transmitted  : 3
Request advertisements transmitted : 0
Number of config revision errors   : 0
Number of config digest errors     : 0
Number of V1 summary errors        : 0`,

  // ── Port Security ─────────────────────────────────────────────
  "show port-security": () =>
`Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
               (Count)       (Count)          (Count)
---------------------------------------------------------------------------
      Gi0/5              2            1                  0         Shutdown
      Gi0/6              1            1                  0         Restrict
---------------------------------------------------------------------------
Total Addresses in System (excluding one mac per port)     : 1
Max Addresses limit in System (excluding one mac per port) : 4096`,

  "show port-security interface": () =>
`Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 2
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0050.7966.6801:10
Security Violation Count   : 0`,

  // ── ACL ───────────────────────────────────────────────────────
  "show access-lists": () =>
`Standard IP access list 10
    10 permit 192.168.1.0, wildcard bits 0.0.0.255 (42 matches)
    20 deny   any (7 matches)
Extended IP access list 100
    10 permit tcp any host 192.168.1.10 eq www (156 matches)
    20 permit tcp any host 192.168.1.10 eq 443 (89 matches)
    30 deny   ip any any log (3 matches)
Extended IP access list BLOCK_TELNET
    10 deny   tcp any any eq 23 log (0 matches)
    20 permit ip any any (0 matches)`,

  "show ip access-lists": () =>
`Extended IP access list 100
    10 permit tcp 192.168.1.0 0.0.0.255 any eq www (156 matches)
    20 permit tcp 192.168.1.0 0.0.0.255 any eq 443 (89 matches)
    30 deny   ip any any log (3 matches)
Extended IP access list OUTBOUND_FILTER
    10 permit tcp 10.0.0.0 0.255.255.255 any established (0 matches)
    20 deny   ip any any (0 matches)`,

  "show ip interface": () =>
`GigabitEthernet0/0 is up, line protocol is up
  Internet address is 203.0.113.1/24
  Broadcast address is 255.255.255.255
  MTU is 1500 bytes
  Inbound  access list is 100
  Outbound access list is not set
GigabitEthernet0/1 is up, line protocol is up
  Internet address is 192.168.1.1/24
  Inbound  access list is 10
  Outbound access list is not set`,


  // ── BGP ───────────────────────────────────────────────────────
  "show ip bgp summary": () =>
`BGP router identifier 10.1.1.1, local AS number 100
BGP table version is 15, main routing table version 15
5 network entries using 740 bytes of memory

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.1.1.2        4          100     125     128       15    0    0 01:52:34        5
10.2.1.1        4          200     120     125       15    0    0 01:48:12        8`,

  "show ip bgp neighbors": () =>
`BGP neighbor is 10.1.1.2,  remote AS 100, internal link
  BGP version 4, remote router ID 10.1.1.2
  BGP state = Established, up for 01:52:34
  Neighbor capabilities:
    Route refresh: advertised and received(new)
    Address family IPv4 Unicast: advertised and received
  Message statistics:
    Opens:    1/1    Notifications: 0/0    Updates: 12/8
    Keepalives: 115/116    Total: 128/125`,

  "show ip bgp": () =>
`BGP table version is 15, local router ID is 10.1.1.1
Status codes: s suppressed, * valid, > best, i internal
Origin codes: i - IGP, e - EGP, ? - incomplete

   Network          Next Hop            Metric LocPrf Weight Path
*> 10.1.0.0/16      0.0.0.0                  0         32768 i
*>i10.1.1.0/24      10.1.1.2                 0    100      0 i
*> 192.168.100.0    0.0.0.0                  0         32768 i
*> 192.168.200.0    10.2.1.1                 0             0 200 i`,

  // ── EIGRP ─────────────────────────────────────────────────────
  "show ip eigrp neighbors": () =>
`EIGRP-IPv4 Neighbors for AS(100)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
0   10.0.2.1                Gi0/0                    12 00:15:23    5   200  0  12
1   10.0.3.1                Gi0/1                    11 00:14:55    8   200  0   9`,

  "show ip eigrp topology": () =>
`EIGRP-IPv4 Topology Table for AS(100)/ID(10.0.1.1)
Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,
       r - reply Status, s - sia Status

P 10.0.1.0/24, 1 successors, FD is 2816
        via Connected, GigabitEthernet0/2
P 10.0.2.0/24, 1 successors, FD is 28160
        via 10.0.2.1 (28160/2816), GigabitEthernet0/0
P 172.16.0.0/16, 1 successors, FD is 2172416
        via 10.0.2.1 (2172416/28160), GigabitEthernet0/0
P 192.168.1.0/24, 1 successors, FD is 2816
        via Connected, GigabitEthernet0/2`,

  "show ip route eigrp": () =>
`Codes: D - EIGRP, EX - EIGRP external

D     172.16.0.0/16 [90/2172416] via 10.0.2.1, 00:03:11, GigabitEthernet0/0
D     172.16.1.0/24 [90/2172416] via 10.0.2.1, 00:03:11, GigabitEthernet0/0
D EX  10.10.10.0/24 [170/2172416] via 10.0.3.1, 00:01:05, GigabitEthernet0/1`,

  // ── HSRP ──────────────────────────────────────────────────────
  "show standby": () =>
`GigabitEthernet0/0 - Group 1
  State is Active
    2 state changes, last state change 00:05:23
  Virtual IP address is 192.168.1.1
  Active virtual MAC address is 0000.0c07.ac01 (MAC In Use)
    Local virtual MAC address is 0000.0c07.ac01 (v1 default)
  Hello time 3 sec, hold time 10 sec
    Next hello sent in 1.696 secs
  Preemption enabled
  Active router is local
  Standby router is 192.168.1.3, priority 90 (expires in 9.696 sec)
  Priority 110 (configured 110)
  Group name is "hsrp-Gi0/0-1" (default)`,

  "show standby brief": () =>
`                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    110 P Active  local           192.168.1.3     192.168.1.1
Gi0/1       2    100   Standby 192.168.2.2     local           192.168.2.1`,

  // ── NAT ───────────────────────────────────────────────────────
  "show ip nat translations": () =>
`Pro Inside global      Inside local       Outside local      Outside global
tcp 203.0.113.10:1025  192.168.1.10:1025  8.8.8.8:80         8.8.8.8:80
tcp 203.0.113.10:1026  192.168.1.11:1026  8.8.8.8:443        8.8.8.8:443
--- 203.0.113.20       192.168.1.20       ---                ---
tcp 203.0.113.1:2048   192.168.1.100:2048 172.217.0.0:80     172.217.0.0:80`,

  "show ip nat statistics": () =>
`Total active translations: 4 (1 static, 3 dynamic; 3 extended)
Outside interfaces:
  GigabitEthernet0/0
Inside interfaces:
  GigabitEthernet0/1
Hits: 1523  Misses: 12
CEF Translated packets: 1523, CEF Punted packets: 0
Expired translations: 8
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 pool INTERNET refcount 3
 pool INTERNET: netmask 255.255.255.248
        start 203.0.113.10 end 203.0.113.17
        type generic, total addresses 8, allocated 1 (12%), misses 0`,

  // ── DHCP ──────────────────────────────────────────────────────
  "show ip dhcp binding": () =>
`Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type       State      Interface
                    Hardware address/
                    User name
192.168.1.100       0100.5079.6668.00       May 16 2026 12:00 AM    Automatic  Active     Gi0/1
192.168.1.101       0100.5079.6668.01       May 16 2026 12:00 AM    Automatic  Active     Gi0/1
192.168.1.102       0100.5079.6668.02       May 16 2026 12:00 AM    Automatic  Active     Gi0/1`,

  "show ip dhcp pool": () =>
`Pool LAN_POOL :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 253
 Leased addresses               : 3
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 192.168.1.103        192.168.1.1      - 192.168.1.254     3`,

  "show ip dhcp conflict": () =>
`IP address        Detection method   Detection time          VRF
192.168.1.50      Ping               May 15 2026 10:23:14    default`,

  // ── NTP ───────────────────────────────────────────────────────
  "show ntp status": () =>
`Clock is synchronized, stratum 3, reference is 10.0.1.254
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
ntp uptime is 1234500 (1/100 of seconds), resolution is 4000
reference time is E8A1B2C3.D4E5F6A7 (12:00:00.000 UTC Mon May 15 2026)
clock offset is 0.5000 msec, root delay is 2.50 msec
root dispersion is 7.81 msec, peer dispersion is 0.38 msec
loopfilter state is 'CTRL' (Normal Controlled Loop), drift is 0.000000000 s/s
system poll interval is 64, last update was 45 sec ago.`,

  "show ntp associations": () =>
`  address         ref clock       st   when   poll reach  delay  offset   disp
*~10.0.1.254      .GPS.            2     32     64   377   1.234   0.500  0.381
 ~10.0.2.254      10.0.1.254       3     45     64   377   2.456   0.750  0.512
* sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured`,

  "show clock": () =>
`12:00:00.000 UTC Mon May 15 2026`,

  // ── SNMP ──────────────────────────────────────────────────────
  "show snmp": () =>
`Chassis: FTX1234ABCD
Contact: admin@smartitlab.com
Location: Server Room A, Rack 3
0 SNMP packets input
    0 Bad SNMP version errors
    0 Unknown community name
    0 Illegal operation for community name supplied
    0 Encoding errors
    0 Number of requested variables
    0 Number of altered variables
    0 Get-request PDUs
    0 Get-next PDUs
    0 Set-request PDUs
    0 Input queue packet drops (Maximum queue size 1000)
0 SNMP packets output
    0 Too big errors (Maximum packet size 1500)
    0 No such name errors
    0 Bad values errors
    0 General errors
    0 Response PDUs
    0 Trap PDUs`,

  "show snmp community": () =>
`Community name: public
Community Index: cisco0
Community SecurityName: public
storage-type: nonvolatile        active

Community name: private
Community Index: cisco1
Community SecurityName: private
storage-type: nonvolatile        active

Community name: SMARTLAB_RO
Community Index: cisco2
Community SecurityName: SMARTLAB_RO
storage-type: nonvolatile        active`,

  // ── Syslog ────────────────────────────────────────────────────
  "show logging": () =>
`Syslog logging: enabled (0 messages dropped, 3 messages rate-limited,
                0 flushes, 0 overruns, xml disabled, filtering disabled)

No Active Message Discriminator.

No Inactive Message Discriminator.

    Console logging: level debugging, 45 messages logged, xml disabled,
                     filtering disabled
    Monitor logging: level debugging, 0 messages logged, xml disabled,
                     filtering disabled
    Buffer logging:  level debugging, 45 messages logged, xml disabled,
                    filtering disabled
    Logging Exception size (8192 bytes)
    Count and timestamp logging messages: disabled
    Persistent logging: disabled

No active filter modules.

    Trap logging: level informational, 45 message lines logged
        Logging to 10.0.1.100  (udp port 514, audit disabled,
              link up),
              45 message lines logged,
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled
        Logging Source-Interface:       VRF Name:

Log Buffer (8192 bytes):
May 15 12:00:01.123: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (10.0.1.50)
May 15 12:00:05.456: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up
May 15 12:00:05.789: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up`,

  "show ip cache flow": () =>
`IP packet size distribution (1M total packets):
   1-32   64   96  128  160  192  224  256  288  320  352  384  416  448  480
   .000 .015 .004 .002 .001 .001 .000 .000 .000 .000 .000 .000 .000 .000 .000

   512  544  576 1024 1536 2048 2560 3072 3584 4096 4608
   .000 .000 .001 .000 .975 .000 .000 .000 .000 .000 .000

IP Flow Switching Cache, 278544 bytes
  2 active, 4094 inactive, 1523 added
  12345 ager polls, 0 flow alloc failures
  Active flows timeout in 30 minutes
  Inactive flows timeout in 15 seconds
IP Sub Flow Cache, 34056 bytes
  0 active, 1024 inactive, 0 added, 0 added to flow
  0 alloc failures, 0 force expire
  1 chunk, 1 chunk added

  Protocol         Total    Flows   Packets Bytes  Packets Active(Sec) Idle(Sec)
  --------         Flows     /Sec     /Flow  /Pkt     /Sec     /Flow     /Flow
  TCP-Telnet           5      0.0         5   100      0.0       1.0      15.0
  TCP-WWW            450      0.0        12   512      0.0       5.0      15.0
  UDP-DNS             68      0.0         1    60      0.0       0.0      15.0
  Total:             523      0.0        10   400      0.0       4.0      15.0`,


  // ── SSH / Security ────────────────────────────────────────────
  "show ip ssh": () =>
`SSH Enabled - version 2.0
Authentication methods:publickey,keyboard-interactive,password
Authentication Publickey Algorithms:x509v3-ssh-rsa,ecdsa-sha2-nistp256,ecdsa-sha2-nistp384,ecdsa-sha2-nistp521,x509v3-ecdsa-sha2-nistp256,x509v3-ecdsa-sha2-nistp384,x509v3-ecdsa-sha2-nistp521,ssh-rsa
Hostkey Algorithms:x509v3-ssh-rsa,ecdsa-sha2-nistp256,ecdsa-sha2-nistp384,ecdsa-sha2-nistp521,ssh-rsa
Encryption Algorithms:aes128-ctr,aes192-ctr,aes256-ctr
MAC Algorithms:hmac-sha2-256,hmac-sha2-512,hmac-sha1,hmac-sha1-96
KEX Algorithms:diffie-hellman-group-exchange-sha256,diffie-hellman-group14-sha256,diffie-hellman-group16-sha512
Authentication timeout: 120 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 2048 bits
IOS Keys in SECSH format(ssh-rsa, base64 encoded): Router
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7...`,

  "show ssh": () =>
`Connection Version Mode Encryption  Hmac         State                 Username
0          2.0     IN   aes256-ctr   hmac-sha2-256 Session started       admin
0          2.0     OUT  aes256-ctr   hmac-sha2-256 Session started       admin`,

  // ── DHCP Snooping / DAI ───────────────────────────────────────
  "show ip dhcp snooping statistics": () =>
`Packets Forwarded                                     = 1523
Packets Dropped                                       = 12
Packets Dropped From untrusted ports                  = 12
  DHCP Discover                                       = 0
  DHCP Offer                                          = 12
  DHCP Request                                        = 0
  DHCP Ack                                            = 0
  DHCP Release                                        = 0
  DHCP Decline                                        = 0
  DHCP Inform                                         = 0
  DHCP Nack                                           = 0`,

  "show ip arp inspection": () =>
`Source Mac Validation      : Disabled
Destination Mac Validation : Disabled
IP Address Validation      : Disabled

 Vlan     Configuration    Operation   ACL Match          Static ACL
 ----     -------------    ---------   ---------          ----------
   10     Enabled          Active      Implicit Deny      No
   20     Enabled          Active      Implicit Deny      No

 Vlan     ACL Logging      DHCP Logging      Probe Logging
 ----     -----------      ------------      -------------
   10     Deny             Deny              Off
   20     Deny             Deny              Off

 Vlan      Forwarded        Dropped     DHCP Drops      ACL Drops
 ----      ---------        -------     ----------      ---------
   10           1523             12             12               0
   20            892              0              0               0`,

  // ── AAA ───────────────────────────────────────────────────────
  "show aaa servers": () =>
`RADIUS: id 1, priority 1, host 10.0.1.200, auth-port 1812, acct-port 1813
     State: current UP, duration 3600s, previous duration 0s
     Dead: total time 0s, count 0
     Quarantined: No
     Authen: request 45, timeouts 0, failover 0, retransmits 0
             Response: accept 40, reject 5, challenge 0
             Response: unexpected 0, server error 0, incorrect 0, time 5ms
             Transaction: success 45, failure 0
     Author: request 0, timeouts 0, failover 0, retransmits 0
             Response: accept 0, reject 0, challenge 0
             Response: unexpected 0, server error 0, incorrect 0, time 0ms
             Transaction: success 0, failure 0
     Account: request 0, timeouts 0, failover 0, retransmits 0
             Request: start 0, interim 0, stop 0
             Response: start 0, interim 0, stop 0
             Response: unexpected 0, server error 0, incorrect 0, time 0ms
             Transaction: success 0, failure 0`,

  "show aaa sessions": () =>
`Total sessions since last reload: 45
Session Id: 1
  Unique Id: 1
  User Name: admin
  IP Address: 10.0.1.50
  Idle Time: 00:00:05
  CT Call Handle: 0`,

  // ── Zone-Based Firewall ───────────────────────────────────────
  "show policy-map type inspect zone-pair": () =>
`policy exists on zp INSIDE-TO-OUTSIDE
  Zone-pair: INSIDE-TO-OUTSIDE

  Service-policy inspect : INSPECT-POLICY

    Class-map: INSPECT-HTTP (match-any)
      Match: protocol http
      Inspect
        Session creations since subsystem startup or last reset 523
        Current session counts (estab/half-open/terminating) [523:0:0]
        Maxever session counts (estab/half-open/terminating) [523:0:0]
        Last session created 00:00:05
        Last statistic reset never
        Last session creation rate 10
        Maxever session creation rate 50
        Last half-open session total 0
        TCP reassembly statistics
          received 0 packets out-of-order; dropped 0
          peak memory usage 0 KB; current usage: 0 KB

    Class-map: class-default (match-any)
      Match: any
      Drop
        0 packets, 0 bytes`,

  // ── Crypto / IPsec ────────────────────────────────────────────
  "show crypto isakmp sa": () =>
`IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
203.0.113.2     203.0.113.1     QM_IDLE           1001 ACTIVE
203.0.113.3     203.0.113.1     QM_IDLE           1002 ACTIVE`,

  "show crypto ipsec sa": () =>
`interface: GigabitEthernet0/0
    Crypto map tag: VPN_MAP, local addr 203.0.113.1

   protected vrf: (none)
   local  ident (addr/mask/prot/port): (10.0.1.0/255.255.255.0/0/0)
   remote ident (addr/mask/prot/port): (10.0.2.0/255.255.255.0/0/0)
   current_peer 203.0.113.2 port 500
     PERMIT, flags={origin_is_acl,}
    #pkts encaps: 1523, #pkts encrypt: 1523, #pkts digest: 1523
    #pkts decaps: 1489, #pkts decrypt: 1489, #pkts verify: 1489
    #pkts compressed: 0, #pkts decompressed: 0
    #pkts not compressed: 0, #pkts compr. failed: 0
    #pkts not decompressed: 0, #pkts decompress failed: 0
    #send errors 0, #recv errors 0

     local crypto endpt.: 203.0.113.1, remote crypto endpt.: 203.0.113.2
     plaintext mtu 1438, path mtu 1500, ip mtu 1500, ip mtu idb GigabitEthernet0/0
     current outbound spi: 0xABCD1234(2882343476)
     PFS (Y/N): N, DH group: none

     inbound esp sas:
      spi: 0x12345678(305419896)
        transform: esp-aes 256 esp-sha-hmac ,
        in use settings ={Tunnel, }
        conn id: 2001, flow_id: SW:1, sibling_flags 80000046, crypto map: VPN_MAP
        sa timing: remaining key lifetime (k/sec): (4607999/3540)
        IV size: 16 bytes
        replay detection support: Y
        Status: ACTIVE(ACTIVE)

     outbound esp sas:
      spi: 0xABCD1234(2882343476)
        transform: esp-aes 256 esp-sha-hmac ,
        in use settings ={Tunnel, }
        conn id: 2002, flow_id: SW:2, sibling_flags 80000046, crypto map: VPN_MAP
        sa timing: remaining key lifetime (k/sec): (4607999/3540)
        IV size: 16 bytes
        replay detection support: Y
        Status: ACTIVE(ACTIVE)`,

  // ── MPLS ──────────────────────────────────────────────────────
  "show mpls interfaces": () =>
`Interface              IP            Tunnel   BGP Static Operational
GigabitEthernet0/0     Yes (ldp)     No       No  No     Yes
GigabitEthernet0/1     Yes (ldp)     No       No  No     Yes`,

  "show mpls ldp neighbor": () =>
`    Peer LDP Ident: 10.0.2.1:0; Local LDP Ident 10.0.1.1:0
        TCP connection: 10.0.2.1.646 - 10.0.1.1.12345
        State: Oper; Msgs sent/rcvd: 45/43; Downstream
        Up time: 00:15:23
        LDP discovery sources:
          GigabitEthernet0/0, Src IP addr: 10.0.12.2
        Addresses bound to peer LDP Ident:
          10.0.2.1        10.0.12.2       172.16.1.1
    Peer LDP Ident: 10.0.3.1:0; Local LDP Ident 10.0.1.1:0
        TCP connection: 10.0.3.1.646 - 10.0.1.1.23456
        State: Oper; Msgs sent/rcvd: 38/36; Downstream
        Up time: 00:12:45`,

  "show mpls forwarding-table": () =>
`Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched       interface
16         Pop Label  10.0.2.0/24      0              Gi0/0      10.0.12.2
17         17         10.0.3.0/24      0              Gi0/0      10.0.12.2
18         Pop Label  172.16.0.0/16    0              Gi0/1      10.0.13.3
19         Aggregate  192.168.1.0/24   0
20         Pop Label  192.168.2.0/24   0              Gi0/0      10.0.12.2`,

  // ── GRE Tunnel ────────────────────────────────────────────────
  "show interfaces tunnel": () =>
`Tunnel0 is up, line protocol is up
  Hardware is Tunnel
  Internet address is 172.16.0.1/30
  MTU 17916 bytes, BW 100 Kbit/sec, DLY 50000 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation TUNNEL, loopback not set
  Keepalive not set
  Tunnel linestate evaluation up
  Tunnel source 203.0.113.1 (GigabitEthernet0/0), destination 203.0.113.2
  Tunnel Subblocks:
     src-track:
        Tunnel0 source tracking subblock associated with GigabitEthernet0/0
         Set of tunnels with source: GigabitEthernet0/0, number of tunnels: 1
  Tunnel protocol/transport GRE/IP
    Key disabled, sequencing disabled
    Checksumming of packets disabled
  Tunnel TTL 255, Fast tunneling enabled
  Tunnel transport MTU 1476 bytes
  Tunnel transmit bandwidth 8000 (kbps)
  Tunnel receive bandwidth 8000 (kbps)
  Last input 00:00:02, output 00:00:02, output hang never
  Last clearing of "show interface" counters never
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0
  Queueing strategy: fifo
  Output queue: 0/0 (size/max)
  5 minute input rate 0 bits/sec, 0 packets/sec
  5 minute output rate 0 bits/sec, 0 packets/sec
     1523 packets input, 152300 bytes, 0 no buffer
     1489 packets output, 148900 bytes, 0 underruns`,

  // ── QoS ───────────────────────────────────────────────────────
  "show policy-map interface": () =>
`GigabitEthernet0/0

  Service-policy output: WAN_QOS_POLICY

    Class-map: VOICE (match-any)
      0 packets, 0 bytes
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: dscp ef (46)
      Queueing
        (total drops) 0
        (bytes output) 0
        bandwidth 512 kbps

    Class-map: VIDEO (match-any)
      0 packets, 0 bytes
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: dscp af41 (34)
      Queueing
        (total drops) 0
        (bytes output) 0
        bandwidth 1024 kbps

    Class-map: class-default (match-any)
      1523 packets, 152300 bytes
      5 minute offered rate 1000 bps, drop rate 0000 bps
      Match: any
      Queueing
        (total drops) 0
        (bytes output) 152300
        bandwidth 512 kbps`,

  // ── SD-WAN ────────────────────────────────────────────────────
  "show sdwan control connections": () =>
`                                          PEER                                          PEER                                          PEER
PEER    PEER PEER            SITE       DOMAIN PEER                                   PRIV  PEER                                   PUB                                                       GROUP
TYPE    PROT SYSTEM IP       ID         ID     PRIVATE IP                             PORT  PUBLIC IP                              PORT  LOCAL COLOR     PROXY STATE UPTIME
------  ---- ---------       ------     ------ ---------                              ----- ---------                              ----- --------------- ----- ----- -----
vsmart  dtls 10.0.0.1        100        1      10.0.0.1                               12346 203.0.113.100                          12346 mpls            No    up    0:05:23:11
vsmart  dtls 10.0.0.1        100        1      10.0.0.1                               12346 203.0.113.100                          12346 biz-internet    No    up    0:05:23:11
vbond   dtls 0.0.0.0         0          0      203.0.113.200                          12346 203.0.113.200                          12346 mpls            No    up    0:05:23:11`,

  "show sdwan bfd sessions": () =>
`                                      SOURCE TLOC      REMOTE TLOC                       DST PUBLIC                      DST PUBLIC         DETECT      TX                              STATE
SYSTEM IP        SITE ID  STATE       COLOR            COLOR            SOURCE IP                                         IP                 PORT        MULT        INTERVAL     UPTIME
---------        -------  -----       -------          -------          ---------                                         --                 ----        -----       --------     ------
10.0.0.2         200      up          mpls             mpls             10.0.1.1                                          10.0.2.1           12346       7           1000         0:02:15:33
10.0.0.2         200      up          biz-internet     biz-internet     203.0.113.1                                       203.0.113.2        12346       7           1000         0:02:15:33`,

  "show sdwan omp peers": () =>
`                                                      DOMAIN    OVERLAY   SITE
PEER             TYPE    DOMAIN ID  R/I/S  UPTIME      ID        ID        ID
-----------      ------  ---------  -----  ------      ------    -------   ----
10.0.0.1         vsmart  1          2/2/2  0:05:23:11  1         1         100`,

  // ── EEM ───────────────────────────────────────────────────────
  "show event manager policy registered": () =>
`No.  Class     Type    Event Type          Trap  Time Registered        Name
1    applet    system  syslog              Off   Mon May 15 12:00:00 2026  INTERFACE_DOWN_RECOVERY
  trigger
    event syslog pattern ".*LINK-3-UPDOWN.*down.*"
  action 1.0 cli command "enable"
  action 2.0 cli command "configure terminal"
  action 3.0 cli command "interface GigabitEthernet0/1"
  action 4.0 cli command "no shutdown"
  action 5.0 syslog msg "EEM: Interface recovery attempted"`,

  "show event manager history events": () =>
`No.  Time                       Event type          Name
1    Mon May 15 12:05:23 2026   syslog              INTERFACE_DOWN_RECOVERY
     Triggered by: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
     Action: cli command executed successfully`,

  // ── General / Physical Layer ──────────────────────────────────
  "show ip interface brief": () =>
`Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.0.1.1        YES manual up                    up
GigabitEthernet0/1     10.0.2.1        YES manual up                    up
GigabitEthernet0/2     192.168.1.1     YES manual up                    up
Tunnel0                172.16.0.1      YES manual up                    up
Vlan1                  unassigned      YES unset  administratively down  down`,

  "show ip int brief": () =>
`Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.0.1.1        YES manual up                    up
GigabitEthernet0/1     10.0.2.1        YES manual up                    up
GigabitEthernet0/2     192.168.1.1     YES manual up                    up
Vlan1                  unassigned      YES unset  administratively down  down`,

  "show interfaces": () =>
`GigabitEthernet0/0 is up, line protocol is up
  Hardware is iGbE, address is 0050.7966.6800 (bia 0050.7966.6800)
  Internet address is 10.0.1.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Keepalive set (10 sec)
  Full Duplex, 1000Mbps, media type is RJ45
  output flow-control is unsupported, input flow-control is unsupported
  ARP type: ARPA, ARP Timeout 04:00:00
  Last input 00:00:01, output 00:00:01, output hang never
  Last clearing of "show interface" counters never
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0
  Queueing strategy: fifo
  Output queue: 0/0 (size/max)
  5 minute input rate 1000 bits/sec, 1 packets/sec
  5 minute output rate 1000 bits/sec, 1 packets/sec
     15230 packets input, 1523000 bytes, 0 no buffer
     14890 packets output, 1489000 bytes, 0 underruns`,

  "show interfaces status": () =>
`Port      Name               Status       Vlan       Duplex  Speed Type
Gi0/1                        connected    10         a-full  a-1G  10/100/1000BaseTX
Gi0/2                        connected    20         a-full  a-1G  10/100/1000BaseTX
Gi0/3                        connected    30         a-full  a-1G  10/100/1000BaseTX
Gi0/4                        notconnect   1          auto    auto  10/100/1000BaseTX
Gi0/24                       connected    trunk      a-full  a-1G  10/100/1000BaseTX`,

  "show version": () =>
`Cisco IOS XE Software, Version 17.06.01a
Cisco IOS Software [Bengaluru], Catalyst L3 Switch Software (CAT9K_IOSXE), Version 17.6.1a
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2021 by Cisco Systems, Inc.

ROM: IOS-XE ROMMON

Router uptime is 2 days, 3 hours, 45 minutes
Uptime for this control processor is 2 days, 3 hours, 47 minutes
System returned to ROM by reload at 12:00:00 UTC Mon May 13 2026
System image file is "bootflash:cat9k_iosxe.17.06.01a.SPA.bin"
Last reload reason: Reload command

cisco C9300-48P (X86) processor (revision V00) with 1392640K/6147K bytes of memory.
Processor board ID FCW2134L0BX
1 Virtual Ethernet interface
52 Gigabit Ethernet interfaces
4 Ten Gigabit Ethernet interfaces
32768K bytes of non-volatile configuration memory.
8388608K bytes of physical memory.
1638400K bytes of Crash Files at crashinfo:.
11264000K bytes of Flash at flash:.

Base Ethernet MAC Address          : 00:50:79:66:68:00
Motherboard Assembly Number        : 73-17959-06
Model Number                       : C9300-48P
System Serial Number               : FCW2134L0BX
Top Assembly Part Number           : 68-5619-01
Top Assembly Revision Number       : A0
Hardware Board Revision Number     : 0x00

Switch Ports Model              SW Version        SW Image              Mode
------ ----- -----              ----------        ----------            ----
*    1 52    C9300-48P          17.06.01a         CAT9K_IOSXE           INSTALL

Configuration register is 0x102`,

  "show arp": () =>
`Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.0.1.1                -   0050.7966.6800  ARPA   GigabitEthernet0/2
Internet  10.0.1.10               5   0050.7966.6801  ARPA   GigabitEthernet0/2
Internet  10.0.1.11               3   0050.7966.6802  ARPA   GigabitEthernet0/2
Internet  10.0.1.254              1   0050.7966.6803  ARPA   GigabitEthernet0/0`,

  "show cdp neighbors": () =>
`Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,
                  D - Remote, C - CVTA, M - Two-port Mac Relay

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
Switch-2         Gig 0/24          162             S I    WS-C2960  Gig 0/1
Router-2         Gig 0/0           148             R      C1111     Gig 0/0
Router-3         Gig 0/1           155             R      C1111     Gig 0/0

Total cdp entries displayed : 3`,

  "show cdp neighbors detail": () =>
`-------------------------
Device ID: Switch-2
Entry address(es):
  IP address: 10.0.1.2
Platform: cisco WS-C2960-24TC-L,  Capabilities: Switch IGMP
Interface: GigabitEthernet0/24,  Port ID (outgoing port): GigabitEthernet0/1
Holdtime : 162 sec

Version :
Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE11
Technical Support: http://www.cisco.com/techsupport

advertisement version: 2
VTP Management Domain: 'SMARTLAB'
Native VLAN: 1
Duplex: full
Management address(es):
  IP address: 10.0.1.2`,

  // ── IPv6 ──────────────────────────────────────────────────────
  "show ipv6 interface brief": () =>
`GigabitEthernet0/0     [up/up]
    FE80::250:79FF:FE66:6800
    2001:DB8:1::1
GigabitEthernet0/1     [up/up]
    FE80::250:79FF:FE66:6801
    2001:DB8:2::1
Loopback0              [up/up]
    FE80::250:79FF:FE66:6802
    2001:DB8:FFFF::1`,

  "show ipv6 neighbors": () =>
`IPv6 Address                              Age Link-layer Addr State Interface
FE80::250:79FF:FE66:6801                    0 0050.7966.6801  REACH Gi0/0
2001:DB8:2::10                              2 0050.7966.6810  STALE Gi0/1
FE80::250:79FF:FE66:6810                    2 0050.7966.6810  STALE Gi0/1`,

  // ── Interfaces VLAN (SVI) ─────────────────────────────────────
  "show interfaces vlan": () =>
`Vlan10 is up, line protocol is up
  Hardware is EtherSVI, address is 0050.7966.6800 (bia 0050.7966.6800)
  Internet address is 192.168.10.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  ARP type: ARPA, ARP Timeout 04:00:00
  Last input 00:00:01, output 00:00:01, output hang never`,

};


// ─── Command Executor ────────────────────────────────────────────
export const executeCommand = (command, device) => {
  const cmd = command.trim().toLowerCase();
  const d = device || "Router";

  // ── Exact match ──────────────────────────────────────────────
  if (OUTPUTS[cmd]) {
    return { output: OUTPUTS[cmd](d), isError: false };
  }

  // ── show running-config variants ─────────────────────────────
  if (cmd === "show running-config" || cmd.startsWith("show run")) {
    if (cmd.includes("section") && cmd.includes("bgp")) {
      return { output: `router bgp 100\n bgp router-id 10.1.1.1\n neighbor 10.1.1.2 remote-as 100\n neighbor 10.2.1.1 remote-as 200\n address-family ipv4\n  neighbor 10.1.1.2 activate\n  neighbor 10.2.1.1 activate\n exit-address-family`, isError: false };
    }
    if (cmd.includes("section") && cmd.includes("ospf")) {
      return { output: `router ospf 1\n router-id 10.0.1.1\n network 10.0.0.0 0.255.255.255 area 0\n area 1 range 192.168.0.0 255.255.0.0`, isError: false };
    }
    if (cmd.includes("section") && cmd.includes("eigrp")) {
      return { output: `router eigrp 100\n network 10.0.0.0 0.255.255.255\n network 172.16.0.0 0.0.255.255\n no auto-summary`, isError: false };
    }
    if (cmd.includes("section") && cmd.includes("access-list")) {
      return { output: `ip access-list extended 100\n 10 permit tcp any host 192.168.1.10 eq 80\n 20 permit tcp any host 192.168.1.10 eq 443\n 30 deny ip any any log`, isError: false };
    }
    if (cmd.includes("include") && cmd.includes("access")) {
      return { output: ` ip access-group 100 in\n ip access-group 10 out\nip access-list extended 100\nip access-list standard 10`, isError: false };
    }
    if (cmd.includes("format json")) {
      return { output: `{\n  "Cisco-IOS-XE-native:native": {\n    "hostname": "${d}",\n    "interface": {\n      "GigabitEthernet": [\n        {\n          "name": "0/0",\n          "ip": {\n            "address": {\n              "primary": {\n                "address": "10.0.1.1",\n                "mask": "255.255.255.0"\n              }\n            }\n          }\n        }\n      ]\n    }\n  }\n}`, isError: false };
    }
    return {
      output: `Building configuration...\n\nCurrent configuration : 4523 bytes\n!\nversion 17.6\nservice timestamps debug datetime msec\nservice timestamps log datetime msec\n!\nhostname ${d}\n!\nenable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0\n!\nip routing\n!\ninterface GigabitEthernet0/0\n ip address 10.0.1.1 255.255.255.0\n no shutdown\n!\ninterface GigabitEthernet0/1\n ip address 10.0.2.1 255.255.255.0\n no shutdown\n!\nrouter ospf 1\n router-id 10.0.1.1\n network 10.0.0.0 0.255.255.255 area 0\n!\nend`,
      isError: false,
    };
  }

  // ── ping ─────────────────────────────────────────────────────
  if (cmd.startsWith("ping")) {
    const parts = cmd.split(/\s+/);
    const target = parts[1] || "unknown";
    const isIPv6 = cmd.includes("ipv6") || (target && target.includes(":"));
    if (isIPv6) {
      return { output: `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`, isError: false };
    }
    return { output: `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`, isError: false };
  }

  // ── traceroute ───────────────────────────────────────────────
  if (cmd.startsWith("traceroute") || cmd.startsWith("tracert")) {
    const target = cmd.split(/\s+/)[1] || "unknown";
    return { output: `Tracing the route to ${target}\n\n  1 10.0.1.1 4 msec 4 msec 4 msec\n  2 10.0.2.1 8 msec 8 msec 8 msec\n  3 ${target} 12 msec 12 msec 12 msec`, isError: false };
  }

  // ── debug commands ───────────────────────────────────────────
  if (cmd.startsWith("debug")) {
    if (cmd.includes("spanning-tree")) {
      return { output: `STP: VLAN0001 Gi0/1 -> listening\nSTP: VLAN0001 Gi0/1 -> learning\nSTP: VLAN0001 Gi0/1 -> forwarding\n*May 15 12:00:01.123: %SPANTREE-5-TOPOTRAP: Topology change detected on GigabitEthernet0/1`, isError: false };
    }
    if (cmd.includes("ospf")) {
      return { output: `*May 15 12:00:01.123: OSPF-1 ADJ   Gi0/0: 2WAY->EXSTART\n*May 15 12:00:01.456: OSPF-1 ADJ   Gi0/0: EXSTART->EXCHANGE\n*May 15 12:00:01.789: OSPF-1 ADJ   Gi0/0: EXCHANGE->LOADING\n*May 15 12:00:02.123: OSPF-1 ADJ   Gi0/0: LOADING->FULL`, isError: false };
    }
    if (cmd.includes("ip nat")) {
      return { output: `*May 15 12:00:01.123: NAT: s=192.168.1.10->203.0.113.10, d=8.8.8.8 [1234]\n*May 15 12:00:01.456: NAT*: s=8.8.8.8, d=203.0.113.10->192.168.1.10 [1234]`, isError: false };
    }
    if (cmd.includes("ip packet")) {
      return { output: `*May 15 12:00:01.123: IP: s=192.168.1.100 (Gi0/1), d=8.8.8.8, len 60, access denied\n*May 15 12:00:01.456: IP: s=192.168.1.10 (Gi0/1), d=8.8.8.8, len 60, rcvd 3`, isError: false };
    }
    if (cmd.includes("ip dhcp")) {
      return { output: `*May 15 12:00:01.123: DHCPD: DHCPDISCOVER received from client 0100.5079.6668.00 on interface GigabitEthernet0/1\n*May 15 12:00:01.456: DHCPD: Sending DHCPOFFER to client 0100.5079.6668.00 (192.168.1.103)`, isError: false };
    }
    return { output: `*May 15 12:00:01.123: Debug output enabled. Use 'undebug all' to disable.\n*May 15 12:00:01.456: ${d}: debug event triggered`, isError: false };
  }

  // ── undebug / no debug ───────────────────────────────────────
  if (cmd.startsWith("undebug") || cmd === "no debug all") {
    return { output: "All possible debugging has been turned off", isError: false };
  }

  // ── clear commands ───────────────────────────────────────────
  if (cmd.startsWith("clear")) {
    if (cmd.includes("ip nat translation")) {
      return { output: "", isError: false };
    }
    if (cmd.includes("ip dhcp binding")) {
      return { output: "", isError: false };
    }
    return { output: "", isError: false };
  }

  // ── show spanning-tree vlan ───────────────────────────────────
  if (cmd.startsWith("show spanning-tree vlan")) {
    const vlan = cmd.split(/\s+/)[3] || "1";
    return { output: `VLAN${vlan.padStart(4,"0")}\n  Spanning tree enabled protocol ieee\n  Root ID    Priority    ${32768 + parseInt(vlan)}\n             Address     0050.7966.6800\n             This bridge is the root\n\n  Bridge ID  Priority    ${32768 + parseInt(vlan)}\n             Address     0050.7966.6800\n\nInterface           Role Sts Cost      Prio.Nbr Type\n------------------- ---- --- --------- -------- ----\nGi0/1               Desg FWD 4         128.1    P2p\nGi0/24              Desg FWD 4         128.24   P2p`, isError: false };
  }

  // ── show interfaces [specific] ────────────────────────────────
  if (cmd.startsWith("show interfaces ") && !cmd.includes("trunk") && !cmd.includes("status") && !cmd.includes("vlan")) {
    const iface = cmd.replace("show interfaces ", "").toUpperCase();
    return { output: `${iface} is up, line protocol is up\n  Hardware is iGbE, address is 0050.7966.6800\n  Internet address is 10.0.1.1/24\n  MTU 1500 bytes, BW 1000000 Kbit/sec\n  Full Duplex, 1000Mbps\n  5 minute input rate 1000 bits/sec, 1 packets/sec\n  5 minute output rate 1000 bits/sec, 1 packets/sec`, isError: false };
  }

  // ── show interfaces vlan [id] ─────────────────────────────────
  if (cmd.startsWith("show interfaces vlan")) {
    const vlan = cmd.split(/\s+/)[3] || "10";
    return { output: `Vlan${vlan} is up, line protocol is up\n  Hardware is EtherSVI, address is 0050.7966.6800\n  Internet address is 192.168.${vlan}.1/24\n  MTU 1500 bytes, BW 1000000 Kbit/sec`, isError: false };
  }

  // ── show ip dhcp snooping ─────────────────────────────────────
  if (cmd.startsWith("show ip dhcp snooping")) {
    if (cmd.includes("statistics")) {
      return { output: OUTPUTS["show ip dhcp snooping statistics"](), isError: false };
    }
    return { output: `Switch DHCP snooping is enabled\nDHCP snooping is configured on following VLANs:\n10,20,30\nDHCP snooping is operational on following VLANs:\n10,20,30\nDHCP snooping is configured on the following L3 Interfaces:\n\nInsertion of option 82 is enabled\n   circuit-id default format: vlan-mod-port\n   remote-id: 0050.7966.6800 (MAC)\nOption 82 on untrusted port is not allowed\nVerification of hwaddr field is enabled\nVerification of giaddr field is enabled\nDHCP snooping trust/rate is configured on the following Interfaces:\n\nInterface                  Trusted    Allow option    Rate limit (pps)\n-----------------------    -------    ------------    ----------------\nGigabitEthernet0/24        yes        yes             unlimited`, isError: false };
  }

  // ── show ip arp inspection ────────────────────────────────────
  if (cmd.startsWith("show ip arp inspection")) {
    return { output: OUTPUTS["show ip arp inspection"](), isError: false };
  }

  // ── show port-security interface ─────────────────────────────
  if (cmd.startsWith("show port-security interface")) {
    return { output: OUTPUTS["show port-security interface"](), isError: false };
  }

  // ── show standby ─────────────────────────────────────────────
  if (cmd.startsWith("show standby")) {
    if (cmd.includes("brief")) {
      return { output: OUTPUTS["show standby brief"](), isError: false };
    }
    return { output: OUTPUTS["show standby"](), isError: false };
  }

  // ── show etherchannel ─────────────────────────────────────────
  if (cmd.startsWith("show etherchannel")) {
    if (cmd.includes("port-channel")) {
      return { output: OUTPUTS["show etherchannel port-channel"](), isError: false };
    }
    return { output: OUTPUTS["show etherchannel summary"](), isError: false };
  }

  // ── show vtp ─────────────────────────────────────────────────
  if (cmd.startsWith("show vtp")) {
    if (cmd.includes("counters")) {
      return { output: OUTPUTS["show vtp counters"](), isError: false };
    }
    return { output: OUTPUTS["show vtp status"](), isError: false };
  }

  // ── show crypto ──────────────────────────────────────────────
  if (cmd.startsWith("show crypto")) {
    if (cmd.includes("ipsec sa")) {
      return { output: OUTPUTS["show crypto ipsec sa"](), isError: false };
    }
    if (cmd.includes("isakmp sa")) {
      return { output: OUTPUTS["show crypto isakmp sa"](), isError: false };
    }
    return { output: `Crypto configuration present. Use 'show crypto isakmp sa' or 'show crypto ipsec sa' for details.`, isError: false };
  }

  // ── show mpls ────────────────────────────────────────────────
  if (cmd.startsWith("show mpls")) {
    if (cmd.includes("ldp neighbor")) {
      return { output: OUTPUTS["show mpls ldp neighbor"](), isError: false };
    }
    if (cmd.includes("forwarding")) {
      return { output: OUTPUTS["show mpls forwarding-table"](), isError: false };
    }
    return { output: OUTPUTS["show mpls interfaces"](), isError: false };
  }

  // ── show sdwan ───────────────────────────────────────────────
  if (cmd.startsWith("show sdwan")) {
    if (cmd.includes("bfd")) {
      return { output: OUTPUTS["show sdwan bfd sessions"](), isError: false };
    }
    if (cmd.includes("omp")) {
      return { output: OUTPUTS["show sdwan omp peers"](), isError: false };
    }
    return { output: OUTPUTS["show sdwan control connections"](), isError: false };
  }

  // ── show event manager ───────────────────────────────────────
  if (cmd.startsWith("show event manager")) {
    if (cmd.includes("history")) {
      return { output: OUTPUTS["show event manager history events"](), isError: false };
    }
    return { output: OUTPUTS["show event manager policy registered"](), isError: false };
  }

  // ── show policy-map ──────────────────────────────────────────
  if (cmd.startsWith("show policy-map")) {
    if (cmd.includes("inspect")) {
      return { output: OUTPUTS["show policy-map type inspect zone-pair"](), isError: false };
    }
    return { output: OUTPUTS["show policy-map interface"](), isError: false };
  }

  // ── show ip nat ──────────────────────────────────────────────
  if (cmd.startsWith("show ip nat")) {
    if (cmd.includes("statistics")) {
      return { output: OUTPUTS["show ip nat statistics"](), isError: false };
    }
    return { output: OUTPUTS["show ip nat translations"](), isError: false };
  }

  // ── show ip dhcp ─────────────────────────────────────────────
  if (cmd.startsWith("show ip dhcp")) {
    if (cmd.includes("binding")) {
      return { output: OUTPUTS["show ip dhcp binding"](), isError: false };
    }
    if (cmd.includes("conflict")) {
      return { output: OUTPUTS["show ip dhcp conflict"](), isError: false };
    }
    return { output: OUTPUTS["show ip dhcp pool"](), isError: false };
  }

  // ── show ip eigrp ────────────────────────────────────────────
  if (cmd.startsWith("show ip eigrp")) {
    if (cmd.includes("topology")) {
      return { output: OUTPUTS["show ip eigrp topology"](), isError: false };
    }
    return { output: OUTPUTS["show ip eigrp neighbors"](), isError: false };
  }

  // ── show ip ospf ─────────────────────────────────────────────
  if (cmd.startsWith("show ip ospf")) {
    if (cmd.includes("database")) {
      if (cmd.includes("summary")) return { output: OUTPUTS["show ip ospf database summary"](), isError: false };
      if (cmd.includes("external")) return { output: OUTPUTS["show ip ospf database external"](), isError: false };
      return { output: OUTPUTS["show ip ospf database"](), isError: false };
    }
    if (cmd.includes("border")) return { output: OUTPUTS["show ip ospf border-routers"](), isError: false };
    if (cmd.includes("neighbor")) return { output: OUTPUTS["show ip ospf neighbor"](), isError: false };
    if (cmd.includes("interface")) return { output: OUTPUTS["show ip ospf interface"](), isError: false };
    return { output: OUTPUTS["show ip ospf neighbor"](), isError: false };
  }

  // ── show ip route [variant] ───────────────────────────────────
  if (cmd.startsWith("show ip route")) {
    if (cmd.includes("static")) return { output: OUTPUTS["show ip route static"](), isError: false };
    if (cmd.includes("ospf")) return { output: OUTPUTS["show ip route ospf"](), isError: false };
    if (cmd.includes("eigrp")) return { output: OUTPUTS["show ip route eigrp"](), isError: false };
    return { output: OUTPUTS["show ip route"](), isError: false };
  }

  // ── show ip bgp ──────────────────────────────────────────────
  if (cmd.startsWith("show ip bgp")) {
    if (cmd.includes("summary")) return { output: OUTPUTS["show ip bgp summary"](), isError: false };
    if (cmd.includes("neighbors")) return { output: OUTPUTS["show ip bgp neighbors"](), isError: false };
    return { output: OUTPUTS["show ip bgp"](), isError: false };
  }

  // ── show ip protocols ────────────────────────────────────────
  if (cmd === "show ip protocols") {
    return { output: OUTPUTS["show ip protocols"](), isError: false };
  }

  // ── show ip access-lists ─────────────────────────────────────
  if (cmd.startsWith("show ip access-lists") || cmd.startsWith("show ip access-list")) {
    return { output: OUTPUTS["show ip access-lists"](), isError: false };
  }

  // ── show ntp ─────────────────────────────────────────────────
  if (cmd.startsWith("show ntp")) {
    if (cmd.includes("associations")) return { output: OUTPUTS["show ntp associations"](), isError: false };
    return { output: OUTPUTS["show ntp status"](), isError: false };
  }

  // ── show snmp ────────────────────────────────────────────────
  if (cmd.startsWith("show snmp")) {
    if (cmd.includes("community")) return { output: OUTPUTS["show snmp community"](), isError: false };
    return { output: OUTPUTS["show snmp"](), isError: false };
  }

  // ── show aaa ─────────────────────────────────────────────────
  if (cmd.startsWith("show aaa")) {
    if (cmd.includes("sessions")) return { output: OUTPUTS["show aaa sessions"](), isError: false };
    return { output: OUTPUTS["show aaa servers"](), isError: false };
  }

  // ── show ipv6 ────────────────────────────────────────────────
  if (cmd.startsWith("show ipv6")) {
    if (cmd.includes("neighbors")) return { output: OUTPUTS["show ipv6 neighbors"](), isError: false };
    return { output: OUTPUTS["show ipv6 interface brief"](), isError: false };
  }

  // ── show queue ───────────────────────────────────────────────
  if (cmd.startsWith("show queue")) {
    return { output: `Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0\nQueueing strategy: Class-based queueing\nOutput queue: 0/1000/64/0 (size/max total/threshold/drops)\n   Conversations  0/1/256 (active/max active/max total)\n   Reserved Conversations 0/0 (allocated/max allocated)\n   Available Bandwidth 7500 kilobits/sec`, isError: false };
  }

  // ── Terminal mode transitions ─────────────────────────────────
  if (["enable","en","exit","end","logout","disable"].includes(cmd)) {
    return { output: "", isError: false };
  }
  if (cmd === "configure terminal" || cmd === "conf t") {
    return { output: `Enter configuration commands, one per line.  End with CNTL/Z.`, isError: false };
  }

  // ── Configuration commands (silent success) ───────────────────
  if (cmd.startsWith("interface ")) {
    return { output: `${d}(config-if)#`, isError: false };
  }
  if (cmd.startsWith("router ospf")) {
    return { output: `${d}(config-router)#`, isError: false };
  }
  if (cmd.startsWith("router eigrp")) {
    return { output: `${d}(config-router)#`, isError: false };
  }
  if (cmd.startsWith("router bgp")) {
    return { output: `${d}(config-router)#`, isError: false };
  }
  if (cmd.startsWith("router rip")) {
    return { output: `${d}(config-router)#`, isError: false };
  }
  if (cmd.startsWith("ip address")) return { output: "", isError: false };
  if (cmd.startsWith("ipv6 address")) return { output: "", isError: false };
  if (cmd.startsWith("ipv6 enable")) return { output: "", isError: false };
  if (cmd.startsWith("ipv6 routing")) return { output: "", isError: false };
  if (cmd.startsWith("ipv6 unicast-routing")) return { output: "", isError: false };
  if (cmd.startsWith("network ")) return { output: "", isError: false };
  if (cmd.startsWith("neighbor ")) return { output: "", isError: false };
  if (cmd.startsWith("vlan ")) return { output: `${d}(config-vlan)#`, isError: false };
  if (cmd.startsWith("switchport ")) return { output: "", isError: false };
  if (cmd.startsWith("spanning-tree ")) return { output: "", isError: false };
  if (cmd.startsWith("channel-group ")) return { output: `Creating a port-channel interface Port-channel 1`, isError: false };
  // ACL sub-commands inside access-list config mode
  if (cmd.startsWith("permit ")) return { output: "", isError: false };
  if (cmd.startsWith("deny ")) return { output: "", isError: false };
  if (cmd.startsWith("remark ")) return { output: "", isError: false };
  // Class-map / policy-map sub-commands
  if (cmd.startsWith("match ")) return { output: "", isError: false };
  if (cmd.startsWith("bandwidth ")) return { output: "", isError: false };
  if (cmd.startsWith("priority ")) return { output: "", isError: false };
  if (cmd.startsWith("fair-queue")) return { output: "", isError: false };
  if (cmd.startsWith("class ")) return { output: `${d}(config-pmap-c)#`, isError: false };
  // OSPF interface/area sub-commands
  if (cmd.startsWith("ip ospf ")) return { output: "", isError: false };
  if (cmd.startsWith("router-id ")) return { output: "", isError: false };
  // RADIUS new-style config
  if (cmd.startsWith("radius server ")) return { output: `${d}(config-radius-server)#`, isError: false };
  if (cmd.startsWith("address ipv4")) return { output: "", isError: false };
  if (cmd.startsWith("key ")) return { output: "", isError: false };
  // AAA sub-commands
  if (cmd.startsWith("aaa authorization")) return { output: "", isError: false };
  if (cmd.startsWith("aaa accounting")) return { output: "", isError: false };
  // Zone-based firewall sub-commands
  if (cmd.startsWith("inspect")) return { output: "", isError: false };
  if (cmd.startsWith("drop")) return { output: "", isError: false };
  if (cmd.startsWith("pass")) return { output: "", isError: false };
  // EEM sub-commands
  if (cmd.startsWith("event timer ")) return { output: "", isError: false };
  if (cmd.startsWith("event interface ")) return { output: "", isError: false };
  // GRE / tunnel sub-commands
  if (cmd.startsWith("tunnel mode ")) return { output: "", isError: false };
  // Misc config
  if (cmd.startsWith("ip domain-name")) return { output: "", isError: false };
  if (cmd.startsWith("ip domain name")) return { output: "", isError: false };
  if (cmd.startsWith("username ")) return { output: "", isError: false };
  if (cmd.startsWith("shutdown")) return { output: "", isError: false };
  if (cmd.startsWith("duplex ")) return { output: "", isError: false };
  if (cmd.startsWith("speed ")) return { output: "", isError: false };
  if (cmd.startsWith("description ")) return { output: "", isError: false };
  if (cmd.startsWith("cdp ")) return { output: "", isError: false };
  if (cmd.startsWith("ip mtu ")) return { output: "", isError: false };
  if (cmd.startsWith("mtu ")) return { output: "", isError: false };
  if (cmd.startsWith("encapsulation dot1q")) return { output: "", isError: false };
  if (cmd.startsWith("vtp ")) return { output: "", isError: false };
  if (cmd.startsWith("standby ")) return { output: "", isError: false };
  if (cmd.startsWith("ip route ")) return { output: "", isError: false };
  if (cmd.startsWith("ip nat ")) return { output: "", isError: false };
  if (cmd.startsWith("ip dhcp ")) return { output: "", isError: false };
  if (cmd.startsWith("ip helper-address")) return { output: "", isError: false };
  if (cmd.startsWith("ip flow ")) return { output: "", isError: false };
  if (cmd.startsWith("ip flow-export ")) return { output: "", isError: false };
  if (cmd.startsWith("ip routing")) return { output: "", isError: false };
  if (cmd.startsWith("ip access-list") || cmd.startsWith("access-list")) return { output: "", isError: false };
  if (cmd.startsWith("ip access-group")) return { output: "", isError: false };
  if (cmd.startsWith("ip arp inspection")) return { output: "", isError: false };
  if (cmd.startsWith("ip ssh ")) return { output: "", isError: false };
  
  // Additional config mode commands
  if (cmd.startsWith("deny ")) return { output: "", isError: false };
  if (cmd.startsWith("permit ")) return { output: "", isError: false };
  if (cmd.startsWith("spanning-tree ")) return { output: "", isError: false };
  if (cmd.startsWith("debug ")) {
    return { 
      output: `Debug output enabled for: ${cmd.substring(6)}\nUse 'undebug all' to disable.`, 
      isError: false 
    };
  }
  if (cmd.startsWith("login local")) return { output: "", isError: false };
  
  if (cmd.startsWith("ntp ")) return { output: "", isError: false };
  if (cmd.startsWith("clock ")) return { output: "", isError: false };
  if (cmd.startsWith("snmp-server ")) return { output: "", isError: false };
  if (cmd.startsWith("logging ")) return { output: "", isError: false };
  if (cmd.startsWith("aaa ")) return { output: "", isError: false };
  if (cmd.startsWith("radius-server ")) return { output: "", isError: false };
  if (cmd.startsWith("zone ")) return { output: `${d}(config-sec-zone)#`, isError: false };
  if (cmd.startsWith("zone-pair ")) return { output: `${d}(config-sec-zone-pair)#`, isError: false };
  if (cmd.startsWith("policy-map ")) return { output: `${d}(config-pmap)#`, isError: false };
  if (cmd.startsWith("class-map ")) return { output: `${d}(config-cmap)#`, isError: false };
  if (cmd.startsWith("service-policy ")) return { output: "", isError: false };
  if (cmd.startsWith("set dscp ")) return { output: "", isError: false };
  if (cmd.startsWith("crypto ")) return { output: "", isError: false };
  if (cmd.startsWith("mpls ")) return { output: "", isError: false };
  if (cmd.startsWith("tunnel ")) return { output: "", isError: false };
  if (cmd.startsWith("event manager ")) return { output: `${d}(config-applet)#`, isError: false };
  if (cmd.startsWith("event syslog")) return { output: "", isError: false };
  if (cmd.startsWith("action ")) return { output: "", isError: false };
  if (cmd.startsWith("hostname ")) return { output: "", isError: false };
  if (cmd.startsWith("enable secret")) return { output: "", isError: false };
  if (cmd.startsWith("enable password")) return { output: "", isError: false };
  if (cmd.startsWith("service password-encryption")) return { output: "", isError: false };
  if (cmd.startsWith("banner ")) return { output: "Enter TEXT message.  End with the character '#'.", isError: false };
  if (cmd.startsWith("line vty") || cmd.startsWith("line con")) return { output: `${d}(config-line)#`, isError: false };
  if (cmd.startsWith("transport input")) return { output: "", isError: false };
  if (cmd.startsWith("login ")) return { output: "", isError: false };
  if (cmd.startsWith("password ")) return { output: "", isError: false };
  if (cmd.startsWith("area ")) return { output: "", isError: false };
  if (cmd.startsWith("redistribute ")) return { output: "", isError: false };
  if (cmd.startsWith("default-router")) return { output: "", isError: false };
  if (cmd.startsWith("dns-server")) return { output: "", isError: false };
  if (cmd.startsWith("lease ")) return { output: "", isError: false };
  if (cmd.startsWith("no ")) return { output: "", isError: false };
  if (cmd === "write" || cmd === "write memory" || cmd === "wr" || cmd.startsWith("copy run")) {
    return { output: "Building configuration...\n[OK]\n0 bytes copied in 0.001 secs (0 bytes/sec)", isError: false };
  }
  if (cmd.startsWith("copy ")) return { output: "Destination filename [startup-config]? \n[OK]", isError: false };

  // ── Unrecognized ─────────────────────────────────────────────
  return {
    output: `% Unrecognized command: "${command}"\n% Type "?" for a list of available commands.`,
    isError: true,
  };
};

// ─── Objective Evaluator ─────────────────────────────────────────
/**
 * Determines which objective indices are newly satisfied by the latest command.
 *
 * @param {string[]} objectives        - Array of objective description strings.
 * @param {string[][]} objectiveCommands - Per-objective arrays of trigger keywords
 *                                        (from lab.objectiveCommands in the DB).
 *                                        Index i → keywords that satisfy objectives[i].
 * @param {string[]} commandHistory    - All commands typed so far (lowercase).
 * @param {number[]} alreadyCompleted  - Objective indices already marked done.
 * @returns {number[]} Newly completed objective indices.
 */
export const evaluateObjectives = (
  objectives,
  objectiveCommands,
  commandHistory,
  alreadyCompleted
) => {
  const done = new Set(alreadyCompleted);
  const newlyCompleted = [];
  const historyLower = commandHistory.map((c) => c.trim().toLowerCase());

  objectives.forEach((_, idx) => {
    if (done.has(idx)) return; // already done — skip

    const triggers = objectiveCommands?.[idx];

    if (triggers && triggers.length > 0) {
      // Data-driven: objective is satisfied when ANY trigger keyword appears
      // in the full command history.
      const satisfied = triggers.some((trigger) =>
        historyLower.some((h) => h.includes(trigger.toLowerCase()))
      );
      if (satisfied) newlyCompleted.push(idx);
    }
    // If no objectiveCommands entry exists for this index, skip —
    // the frontend keyword fallback handles it.
  });

  return newlyCompleted;
};

