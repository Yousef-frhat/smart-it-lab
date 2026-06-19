with open(r'd:\Smart It Lab\SmartBackend\src\database\seed.js', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # lab-m3-1
    (
        'commands:["ip route 192.168.2.0 255.255.255.0 10.0.1.2","ip route 0.0.0.0 0.0.0.0 10.0.1.254","show ip route","show ip route static"], hints:',
        'commands:["ip route 192.168.2.0 255.255.255.0 10.0.1.2","ip route 0.0.0.0 0.0.0.0 10.0.1.254","show ip route","show ip route static"], objectiveCommands:[["ip route 192.168.2.0","ip route"],["ip route 0.0.0.0"],["ip route 0.0.0.0 0.0.0.0","floating"],["show ip route"],["show ip route static","no ip route"]], hints:'
    ),
    # lab-m3-2
    (
        'commands:["router ospf 1","network 10.0.0.0 0.255.255.255 area 0","show ip ospf neighbor","show ip ospf database","show ip route ospf"], hints:',
        'commands:["router ospf 1","network 10.0.0.0 0.255.255.255 area 0","show ip ospf neighbor","show ip ospf database","show ip route ospf"], objectiveCommands:[["router ospf 1","router ospf"],["router-id"],["network 10.0.0.0","network "],["show ip ospf neighbor"],["show ip route ospf"]], hints:'
    ),
    # lab-m3-3
    (
        'commands:["router ospf 1","area 1 range 192.168.0.0 255.255.0.0","show ip ospf border-routers","show ip ospf database summary","show ip route ospf"], hints:',
        'commands:["router ospf 1","area 1 range 192.168.0.0 255.255.0.0","show ip ospf border-routers","show ip ospf database summary","show ip route ospf"], objectiveCommands:[["network ","area 0"],["area 1","abr"],["area 1 range","area range"],["show ip route ospf"],["show ip ospf border-routers"]], hints:'
    ),
    # lab-m3-4
    (
        'commands:["router eigrp 100","network 10.0.0.0 0.255.255.255","show ip eigrp neighbors","show ip eigrp topology","show ip route eigrp"], hints:',
        'commands:["router eigrp 100","network 10.0.0.0 0.255.255.255","show ip eigrp neighbors","show ip eigrp topology","show ip route eigrp"], objectiveCommands:[["router eigrp 100","router eigrp"],["network "],["show ip eigrp neighbors"],["show ip eigrp topology"],["show ip route eigrp"]], hints:'
    ),
    # lab-m3-5
    (
        'commands:["redistribute static subnets","redistribute ospf 1 metric 10000 100 255 1 1500","show ip route","show ip ospf database external"], hints:',
        'commands:["redistribute static subnets","redistribute ospf 1 metric 10000 100 255 1 1500","show ip route","show ip ospf database external"], objectiveCommands:[["redistribute static"],["redistribute ospf","redistribute eigrp"],["show ip route"],["show ip ospf database external"],["route-map","tag"]], hints:'
    ),
    # lab-m3-6
    (
        'commands:["standby 1 ip 192.168.1.1","standby 1 priority 110","standby 1 preempt","show standby","show standby brief"], hints:',
        'commands:["standby 1 ip 192.168.1.1","standby 1 priority 110","standby 1 preempt","show standby","show standby brief"], objectiveCommands:[["standby 1 ip","standby ip"],["standby 1 priority 110","standby priority"],["standby 1 preempt","standby preempt"],["standby 1 priority 90","standby priority 90"],["show standby brief"]], hints:'
    ),
    # lab-m4-1
    (
        'commands:["ip na',
        'objectiveCommands:[["ip nat inside source static"],["ip nat pool"],["ip nat inside source list","overload"],["ip nat inside","ip nat outside"],["show ip nat translations"]], commands:["ip na'
    ),
    # lab-m4-2
    (
        'commands:["ip dhcp excluded-address 192.168.1.1 192.168.1.10","ip dhcp pool LAN_POOL","network 192.168.1.0 255.255.255.0","default-router 192.168.1.1","ip helper-address 10.0.1.1","show ip dhcp binding","show ip dhcp pool"], hints:',
        'commands:["ip dhcp excluded-address 192.168.1.1 192.168.1.10","ip dhcp pool LAN_POOL","network 192.168.1.0 255.255.255.0","default-router 192.168.1.1","ip helper-address 10.0.1.1","show ip dhcp binding","show ip dhcp pool"], objectiveCommands:[["ip dhcp excluded-address"],["ip dhcp pool"],["network 192.168.1.0"],["default-router"],["ip helper-address"]], hints:'
    ),
    # lab-m4-3
    (
        'commands:["ntp master 2","ntp server 10.0.1.1","clock timezone UTC 0","show ntp status","show ntp associations","show clock"], hints:',
        'commands:["ntp master 2","ntp server 10.0.1.1","clock timezone UTC 0","show ntp status","show ntp associations","show clock"], objectiveCommands:[["ntp master 2","ntp master"],["ntp server"],["clock timezone"],["show ntp status"],["show ntp associations"]], hints:'
    ),
    # lab-m4-4
    (
        'commands:["snmp-server community public RO","snmp-server community private RW","snmp-server host 10.0.1.100 version 2c public","snmp-server enable traps","show snmp","show snmp community"], hints:',
        'commands:["snmp-server community public RO","snmp-server community private RW","snmp-server host 10.0.1.100 version 2c public","snmp-server enable traps","show snmp","show snmp community"], objectiveCommands:[["snmp-server community public ro","snmp-server community"],["snmp-server community private rw"],["snmp-server host"],["snmp-server enable traps"],["show snmp"]], hints:'
    ),
    # lab-m4-5
    (
        'commands:["logging host 10.0.1.100","logging trap informational","ip flow ingress","ip flow-export destination 10.0.1.100 9996","show logging","show ip cache flow"], hints:',
        'commands:["logging host 10.0.1.100","logging trap informational","ip flow ingress","ip flow-export destination 10.0.1.100 9996","show logging","show ip cache flow"], objectiveCommands:[["logging host"],["logging trap informational","logging trap"],["ip flow ingress"],["ip flow-export destination"],["show logging"]], hints:'
    ),
    # lab-m5-1
    (
        'commands:["ip access-list extended BLOCK_TELNET","deny tcp any any eq 23 log","permit ip any any","ip access-group BLOCK_TELNET in","show ip access-lists"], hints:',
        'commands:["ip access-list extended BLOCK_TELNET","deny tcp any any eq 23 log","permit ip any any","ip access-group BLOCK_TELNET in","show ip access-lists"], objectiveCommands:[["ip access-list extended","access-list 100"],["ip access-list extended block_telnet","deny tcp any any eq 23","access-list extended"],["ip access-group","access-group"],["ip access-group","access-group"],["show ip access-lists"]], hints:'
    ),
    # lab-m5-2
    (
        'commands:["aaa new-model","aaa authentication login default group radius local","radius-server host 10.0.1.200 auth-port 1812","show aaa servers","show aaa sessions"], hints:',
        'commands:["aaa new-model","aaa authentication login default group radius local","radius-server host 10.0.1.200 auth-port 1812","show aaa servers","show aaa sessions"], objectiveCommands:[["aaa new-model"],["aaa authentication login default group radius local","aaa authentication"],["radius-server host","radius server"],["aaa authentication login default group radius local","aaa authentication"],["show aaa servers"]], hints:'
    ),
    # lab-m5-3
    (
        'commands:["zone security INSIDE","zone-pair security IN-TO-OUT source INSIDE destination OUTSIDE","class-map type inspect match-any HTTP-TRAFFIC","policy-map type inspect INSPECT-POLICY","show policy-map type inspect zone-pair"], hints:',
        'commands:["zone security INSIDE","zone-pair security IN-TO-OUT source INSIDE destination OUTSIDE","class-map type inspect match-any HTTP-TRAFFIC","policy-map type inspect INSPECT-POLICY","show policy-map type inspect zone-pair"], objectiveCommands:[["zone security inside","zone security outside","zone security"],["zone-pair security"],["class-map type inspect"],["policy-map type inspect"],["show policy-map type inspect zone-pair"]], hints:'
    ),
    # lab-m5-4
    (
        'commands:["crypto key generate rsa modulus 2048","ip ssh version 2","line vty 0 4","transport input ssh","ip ssh time-out 60","show ip ssh","show ssh"], hints:',
        'commands:["crypto key generate rsa modulus 2048","ip ssh version 2","line vty 0 4","transport input ssh","ip ssh time-out 60","show ip ssh","show ssh"], objectiveCommands:[["crypto key generate rsa"],["ip ssh version 2"],["line vty 0 4","line vty"],["transport input ssh"],["ip ssh time-out 60","ip ssh timeout"]], hints:'
    ),
    # lab-m5-5
    (
        'commands:["ip dhcp snooping","ip dhcp snooping vlan 10,20","ip dhcp snooping trust","ip arp inspection vlan 10,20","show ip dhcp snooping statistics","show ip arp inspection"], hints:',
        'commands:["ip dhcp snooping","ip dhcp snooping vlan 10,20","ip dhcp snooping trust","ip arp inspection vlan 10,20","show ip dhcp snooping statistics","show ip arp inspection"], objectiveCommands:[["ip dhcp snooping"],["ip dhcp snooping vlan"],["ip dhcp snooping trust"],["ip arp inspection vlan"],["show ip dhcp snooping statistics"]], hints:'
    ),
    # lab-m6-1
    (
        'commands:["show running-config | format json","show ip interface brief","show version"], hints:',
        'commands:["show running-config | format json","show ip interface brief","show version"], objectiveCommands:[["show running-config","show run"],["show ip interface brief","show ip int brief"],["show ip interface brief","show ip int brief"],["show running-config","show run"],["show running-config | format json","show run"]], hints:'
    ),
    # lab-m6-2
    (
        'commands:["show version","show ip interface brief","configure terminal","hostname NetmikoRouter","show running-config"], hints:',
        'commands:["show version","show ip interface brief","configure terminal","hostname NetmikoRouter","show running-config"], objectiveCommands:[["show version"],["show ip interface brief","show ip int brief"],["configure terminal","conf t"],["hostname"],["show running-config","show run"]], hints:'
    ),
    # lab-m6-3
    (
        'commands:["show running-config","show ip interface brief","show ip route","show ip ospf neighbor"], hints:',
        'commands:["show running-config","show ip interface brief","show ip route","show ip ospf neighbor"], objectiveCommands:[["show running-config","show run"],["show ip interface brief","show ip int brief"],["show running-config","show run"],["show ip interface brief","show ip int brief"],["show ip route"]], hints:'
    ),
    # lab-m6-4
    (
        'commands:["event manager applet INTF_RECOVERY","event syslog pattern \\"LINK-3-UPDOWN.*down\\"","action 1.0 cli command \\"enable\\"","show event manager policy registered","show event manager history events"], hints:',
        'commands:["event manager applet INTF_RECOVERY","event syslog pattern \\"LINK-3-UPDOWN.*down\\"","action 1.0 cli command \\"enable\\"","show event manager policy registered","show event manager history events"], objectiveCommands:[["event manager applet"],["event syslog pattern"],["action 1.0 cli command","action"],["show event manager policy registered"],["show event manager history events"]], hints:'
    ),
    # lab-m7-1
    (
        'commands:["interface tunnel 0","tunnel source GigabitEthernet0/0","tunnel destination 203.0.113.2","tunnel mode gre ip","ip address 172.16.0.1 255.255.255.252","show interfaces tunnel","show ip route"], hints:',
        'commands:["interface tunnel 0","tunnel source GigabitEthernet0/0","tunnel destination 203.0.113.2","tunnel mode gre ip","ip address 172.16.0.1 255.255.255.252","show interfaces tunnel","show ip route"], objectiveCommands:[["interface tunnel 0","interface tunnel"],["tunnel source"],["tunnel destination"],["ip address 172.16.0.1","ip address"],["show interfaces tunnel"]], hints:'
    ),
    # lab-m7-2
    (
        'commands:["crypto isakmp policy 10","crypto ipsec transform-set VPN_SET esp-aes 256 esp-sha-hmac","crypto map VPN_MAP 10 ipsec-isakmp","show crypto isakmp sa","show crypto ipsec sa"], hints:',
        'commands:["crypto isakmp policy 10","crypto ipsec transform-set VPN_SET esp-aes 256 esp-sha-hmac","crypto map VPN_MAP 10 ipsec-isakmp","show crypto isakmp sa","show crypto ipsec sa"], objectiveCommands:[["crypto isakmp policy"],["crypto ipsec transform-set"],["crypto map"],["crypto map","ip access-list"],["show crypto isakmp sa"]], hints:'
    ),
    # lab-m7-3
    (
        'commands:["mpls ip","mpls label protocol ldp","show mpls interfaces","show mpls ldp neighbor","show mpls forwarding-table"], hints:',
        'commands:["mpls ip","mpls label protocol ldp","show mpls interfaces","show mpls ldp neighbor","show mpls forwarding-table"], objectiveCommands:[["mpls ip"],["show mpls ldp neighbor","mpls label protocol ldp"],["show mpls ldp neighbor"],["show mpls interfaces","mpls ip"],["show mpls forwarding-table"]], hints:'
    ),
    # lab-m7-4
    (
        'commands:["show sdwan control connections","show sdwan bfd sessions","show sdwan omp peers"], hints:',
        'commands:["show sdwan control connections","show sdwan bfd sessions","show sdwan omp peers"], objectiveCommands:[["show sdwan control connections","show sdwan"],["show sdwan control connections"],["show sdwan bfd sessions"],["show sdwan omp peers"],["show sdwan bfd sessions","show sdwan"]], hints:'
    ),
    # lab-m7-5
    (
        'commands:["class-map match-any VOICE","match dscp ef","policy-map WAN_QOS","service-policy output WAN_QOS","show policy-map interface","show queue GigabitEthernet0/0"], hints:',
        'commands:["class-map match-any VOICE","match dscp ef","policy-map WAN_QOS","service-policy output WAN_QOS","show policy-map interface","show queue GigabitEthernet0/0"], objectiveCommands:[["class-map match-any voice","class-map"],["class-map match-any video","match dscp af41"],["policy-map"],["service-policy output"],["show policy-map interface"]], hints:'
    ),
    # lab-m8-1
    (
        'commands:["show spanning-tree detail","show interfaces trunk","show mac address-table","debug spanning-tree events","show spanning-tree vlan 1"], hints:',
        'commands:["show spanning-tree detail","show interfaces trunk","show mac address-table","debug spanning-tree events","show spanning-tree vlan 1"], objectiveCommands:[["show spanning-tree detail"],["show spanning-tree detail","show spanning-tree"],["show interfaces trunk"],["spanning-tree portfast","portfast"],["show spanning-tree vlan 1","show spanning-tree"]], hints:'
    ),
    # lab-m8-2
    (
        'commands:["show ip route","show ip ospf neighbor","show ip ospf interface","debug ip ospf adj","show ip protocols"], hints:',
        'commands:["show ip route","show ip ospf neighbor","show ip ospf interface","debug ip ospf adj","show ip protocols"], objectiveCommands:[["show ip route"],["show ip ospf neighbor"],["show ip ospf neighbor"],["show ip ospf interface","ip ospf mtu-ignore"],["show ip ospf interface","ip ospf authentication"]], hints:'
    ),
    # lab-m8-3
    (
        'commands:["show ip access-lists","show running-config | section access-list","debug ip packet","show interfaces GigabitEthernet0/0"], hints:',
        'commands:["show ip access-lists","show running-config | section access-list","debug ip packet","show interfaces GigabitEthernet0/0"], objectiveCommands:[["show ip access-lists"],["show ip access-lists","show access-lists"],["show ip access-lists","show running-config"],["log","show ip access-lists"],["show ip access-lists","debug ip packet"]], hints:'
    ),
    # lab-m8-4
    (
        'commands:["show ip nat translations","show ip nat statistics","debug ip nat","clear ip nat translation *"], hints:',
        'commands:["show ip nat translations","show ip nat statistics","debug ip nat","clear ip nat translation *"], objectiveCommands:[["show ip nat translations","show ip nat statistics"],["show ip nat translations","show ip nat"],["debug ip nat","show ip nat translations"],["show ip nat translations"],["clear ip nat translation"]], hints:'
    ),
    # lab-m8-5
    (
        'commands:["show ip dhcp binding","show ip dhcp conflict","show ip dhcp pool","debug ip dhcp server events"], hints:',
        'commands:["show ip dhcp binding","show ip dhcp conflict","show ip dhcp pool","debug ip dhcp server events"], objectiveCommands:[["show ip dhcp pool"],["show ip dhcp conflict"],["ip helper-address","show ip dhcp binding"],["ip dhcp snooping","show ip dhcp snooping"],["show ip dhcp binding","debug ip dhcp server events"]], hints:'
    ),
    # lab-m8-6
    (
        'commands:["show interfaces","show ip interface brief","show vlan brief","show ip route","show ip ospf neighbor","show ip nat translations","show ip access-lists"], hints:',
        'commands:["show interfaces","show ip interface brief","show vlan brief","show ip route","show ip ospf neighbor","show ip nat translations","show ip access-lists"], objectiveCommands:[["show interfaces","show ip interface brief"],["show vlan brief","show interfaces trunk"],["show ip route","show ip ospf neighbor"],["show ip nat translations","show ip dhcp binding"],["show ip access-lists","show access-lists"]], hints:'
    ),
]

count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        count += 1
    else:
        print(f"NOT FOUND: {old[:80]}")

with open(r'd:\Smart It Lab\SmartBackend\src\database\seed.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Done - applied {count}/{len(replacements)} replacements")
