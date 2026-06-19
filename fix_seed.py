import re

with open(r'd:\Smart It Lab\SmartBackend\src\database\seed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# lab-m1-5: add objectiveCommands before closing },
old = '    commands: ["show interfaces status", "show cdp neighbors", "show cdp neighbors detail"],\n    hints: ['
new = '    commands: ["show interfaces status", "show cdp neighbors", "show cdp neighbors detail"],\n    objectiveCommands: [["show interfaces status"],["show interfaces status"],["show interfaces status"],["show cdp neighbors"],["show cdp neighbors detail"]],\n    hints: ['
content = content.replace(old, new, 1)

# Module 2 labs - these are already compact one-liners, add objectiveCommands

# lab-m2-1
old = '    commands: ["show spanning-tree", "show spanning-tree vlan 1", "spanning-tree vlan 1 priority 4096", "spanning-tree portfast", "show spanning-tree detail"],\n    hints: ['
new = '    commands: ["show spanning-tree", "show spanning-tree vlan 1", "spanning-tree vlan 1 priority 4096", "spanning-tree portfast", "show spanning-tree detail"],\n    objectiveCommands: [["show spanning-tree"],["show spanning-tree"],["spanning-tree vlan 1 priority","spanning-tree vlan"],["spanning-tree portfast","portfast"],["show spanning-tree detail"]],\n    hints: ['
content = content.replace(old, new, 1)

# lab-m2-2
old = '    commands: ["channel-group 1 mode active", "channel-group 2 mode desirable", "show etherchannel summary", "show etherchannel port-channel"],\n    hints: ['
new = '    commands: ["channel-group 1 mode active", "channel-group 2 mode desirable", "show etherchannel summary", "show etherchannel port-channel"],\n    objectiveCommands: [["channel-group 1 mode active","channel-group mode active"],["channel-group 2 mode desirable","channel-group mode desirable"],["show etherchannel summary"],["show etherchannel port-channel"],["show etherchannel summary","show etherchannel"]],\n    hints: ['
content = content.replace(old, new, 1)

# lab-m2-3
old = '    commands: ["interface GigabitEthernet0/0.10", "encapsulation dot1q 10", "ip address 192.168.10.1 255.255.255.0", "show ip route", "show vlan brief"],\n    hints: ['
new = '    commands: ["interface GigabitEthernet0/0.10", "encapsulation dot1q 10", "ip address 192.168.10.1 255.255.255.0", "show ip route", "show vlan brief"],\n    objectiveCommands: [["switchport mode trunk","show interfaces trunk"],["interface gigabitethernet0/0.10","interface gi0/0.10"],["encapsulation dot1q 10"],["encapsulation dot1q 20","ip address 192.168.20"],["show ip route"]],\n    hints: ['
content = content.replace(old, new, 1)

# lab-m2-4
old = '    commands: ["vtp mode server", "vtp domain SMARTLAB", "vtp password Cisco123", "show vtp status", "show vtp counters"],\n    hints: ['
new = '    commands: ["vtp mode server", "vtp domain SMARTLAB", "vtp password Cisco123", "show vtp status", "show vtp counters"],\n    objectiveCommands: [["vtp domain"],["vtp mode server"],["vtp mode client"],["vtp domain","vlan "],["show vtp status"]],\n    hints: ['
content = content.replace(old, new, 1)

# lab-m2-5
old = '    commands: ["switchport port-security", "switchport port-security maximum 2", "switchport port-security violation restrict", "switchport port-security mac-address sticky", "show port-security", "show port-security interface GigabitEthernet0/1"],\n    hints: ['
new = '    commands: ["switchport port-security", "switchport port-security maximum 2", "switchport port-security violation restrict", "switchport port-security mac-address sticky", "show port-security", "show port-security interface GigabitEthernet0/1"],\n    objectiveCommands: [["switchport port-security"],["switchport port-security maximum 2","port-security maximum"],["switchport port-security violation restrict","port-security violation"],["switchport port-security mac-address sticky","port-security mac-address sticky"],["show port-security"]],\n    hints: ['
content = content.replace(old, new, 1)

# lab-m2-6
old = '    commands: ["ip routing", "interface vlan 10", "ip address 192.168.10.1 255.255.255.0", "show ip route", "show interfaces vlan 10"],\n    hints: ['
new = '    commands: ["ip routing", "interface vlan 10", "ip address 192.168.10.1 255.255.255.0", "show ip route", "show interfaces vlan 10"],\n    objectiveCommands: [["ip routing"],["interface vlan 10","interface vlan"],["ip address 192.168.10.1","ip address 192.168."],["show interfaces vlan"],["show ip route"]],\n    hints: ['
content = content.replace(old, new, 1)

with open(r'd:\Smart It Lab\SmartBackend\src\database\seed.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done - m1-5 through m2-6")
