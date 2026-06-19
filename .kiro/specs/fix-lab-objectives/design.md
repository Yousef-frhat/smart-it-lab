# Design Document — Fix Labs Useful Commands & Scoring System

## Overview

This design addresses the mismatch between Useful Commands, terminal-engine.js outputs, objective validation logic, and scoring calculation. The fix ensures that when students click and execute all Useful Commands in order, they achieve 100% completion for ALL 46 labs (lab-1 through lab-m8-6).

---

## Current System Analysis

### Lab Structure (seed.js)
```javascript
{
  labId: "lab-1",
  objectives: ["Configure OSPF...", "Establish neighbors...", ...],  // 5 objectives
  commands: ["show ip ospf neighbor", "show ip route", ...],          // 5 commands (Useful Commands)
  objectiveCommands: [
    ["show ip ospf neighbor", "show ip ospf interface"],              // obj[0] triggers
    ["show ip ospf neighbor"],                                        // obj[1] triggers
    ["show ip route"],                                                // obj[2] triggers
    ...
  ]
}
```

### Terminal Engine (terminal-engine.js)
- Maps command patterns to Cisco IOS output strings
- Uses exact string matching or regex patterns
- Returns `{ output, isError }` for each command

### Objective Validator (lab.controller.js → runCommand)
```javascript
// Current logic:
for (let i = 0; i < totalObjectives; i++) {
  const triggers = labDoc.objectiveCommands?.[i];
  if (triggers && triggers.length > 0) {
    const matched = triggers.some((trigger) =>
      normalizedInput.includes(normalize(trigger))
    );
    if (matched) {
      alreadyCompleted.add(i);
      newlyCompletedIds.push(i);
    }
  }
}
```

### Score Calculation
```javascript
const score = totalObjectives > 0
  ? Math.round((completedArray.length / totalObjectives) * 100)
  : 0;
```

### Click-to-Execute (lab-interface.tsx)
```typescript
const handleRunUsefulCommand = async (cmd: string) => {
  setCommandInput(cmd);  // Shows command in input
  await new Promise(resolve => setTimeout(resolve, 80));  // Visual delay
  const entry = await apiExecuteCommand(id, cmd, device);  // Executes
  setTerminalHistory(prev => [...prev, entry]);
  setCommandInput("");  // Clears input
};
```

---

## Problems Identified

### Problem 1: Missing objectiveCommands Arrays
Many labs have empty or missing `objectiveCommands` arrays, causing objectives to never complete.

**Example**: lab-m1-1 has 5 objectives but objectiveCommands might be incomplete.

### Problem 2: Terminal Engine Missing Command Outputs
Some Useful Commands don't have matching patterns in terminal-engine.js OUTPUTS map.

**Example**: `show version` is in many labs' commands but might not have output defined.

### Problem 3: Objective Validation Pattern Mismatch
objectiveCommands triggers don't match the actual commands students type.

**Example**: Trigger is `"show ip ospf neighbor"` but student types `"show ip ospf neighbors"` (plural).

### Problem 4: Score Calculation Timing
Score updates only when commands are executed, not when "Submit Lab" is clicked.

### Problem 5: Click-to-Execute Doesn't Auto-Submit
Currently just populates the input field — student must still press Enter.

---

## Solution Design

### Phase 1: Audit All Labs
Create an audit script that:
1. Reads all 46 labs from seed.js
2. For each lab, extracts:
   - labId, name
   - objectives[] (count)
   - commands[] (Useful Commands)
   - objectiveCommands[] (trigger arrays)
3. Identifies issues:
   - Missing objectiveCommands entries
   - objectiveCommands.length !== objectives.length
   - Commands not in terminal-engine.js OUTPUTS

**Output**: JSON audit report with issues flagged per lab.

### Phase 2: Fix Lab Definitions (seed.js)
For each lab with missing/incorrect objectiveCommands:
1. Generate trigger keywords from commands array
2. Use command prefixes that uniquely identify the command
3. Support multiple triggers per objective (OR logic)
4. Preserve original objectives text

**Example Fix**:
```javascript
// Before:
objectiveCommands: []

// After:
objectiveCommands: [
  ["show version"],                    // obj[0]: Identify device hardware
  ["show interfaces"],                 // obj[1]: View Layer 2 MAC addresses
  ["show version"],                    // obj[2]: Identify device hardware (duplicate trigger OK)
  ["show interfaces"],                 // obj[3]: View encapsulation
  ["show arp"]                         // obj[4]: View Layer 3 mappings
]
```

### Phase 3: Fix Terminal Engine (terminal-engine.js)
For each missing command:
1. Add entry to OUTPUTS map
2. Generate realistic Cisco IOS output
3. Include keywords that objective validators expect
4. Use proper Cisco IOS formatting (headers, columns, data)

**Example Addition**:
```javascript
"show version": () =>
`Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.7(3)M4a
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2018 by Cisco Systems, Inc.
Compiled Tue 18-Sep-18 13:07 by prod_rel_team

ROM: System Bootstrap, Version 15.0(1r)M16, RELEASE SOFTWARE (fc1)

Router uptime is 2 hours, 15 minutes
System returned to ROM by power-on
System image file is "flash:c2900-universalk9-mz.SPA.157-3.M4a.bin"
Last reload type: Normal Reload

cisco C2951 (revision 1.0) with 487424K/36864K bytes of memory.
Processor board ID FTX1234ABCD
3 Gigabit Ethernet interfaces
1 terminal line
DRAM configuration is 64 bits wide with parity disabled.
255K bytes of non-volatile configuration memory.
250880K bytes of ATA System CompactFlash 0 (Read/Write)

Configuration register is 0x2102`,
```

### Phase 4: Fix Objective Validation Logic (lab.controller.js)
Current logic is correct — uses case-insensitive substring matching.
No changes needed unless specific pattern bugs are found during testing.

### Phase 5: Fix Scoring Logic
Already correct:
```javascript
const score = Math.round((completedObjectives.length / totalObjectives) * 100);
```
Ensure this formula is used consistently in:
- `runCommand` (after objective validation)
- `handleSubmitLab` (frontend calculation)
- `saveProgress` (backend persistence)

### Phase 6: Fix Click-to-Execute (lab-interface.tsx)
Change `handleRunUsefulCommand` to auto-submit:
```typescript
const handleRunUsefulCommand = async (cmd: string) => {
  if (!id || !selectedDevice || lab?.status !== 'running') return;
  
  // Set command in input for visual feedback
  setCommandInput(cmd);
  
  // Small delay for visual feedback
  await new Promise(resolve => setTimeout(resolve, 80));
  
  // Execute immediately (no manual Enter needed)
  try {
    const entry = await apiExecuteCommand(id, cmd, currentDevice?.name ?? selectedDevice);
    setTerminalHistory(prev => [...prev, entry]);
    setCommandInput("");  // Clear after execution
  } catch (error) {
    // Error handling...
  }
};
```

**Already implemented correctly** — no changes needed.

---

## Implementation Strategy

### Step 1: Create Audit Script
File: `SmartBackend/src/database/audit-labs.js`

```javascript
import Lab from './schemas/lab.model.js';
import { OUTPUTS } from '../modules/labs/terminal-engine.js';

async function auditLabs() {
  const labs = await Lab.find().lean();
  const issues = [];

  for (const lab of labs) {
    const labIssues = {
      labId: lab.labId,
      name: lab.name,
      objectivesCount: lab.objectives.length,
      commandsCount: lab.commands.length,
      objectiveCommandsCount: lab.objectiveCommands?.length || 0,
      missingObjectiveCommands: [],
      missingTerminalOutputs: [],
    };

    // Check objectiveCommands length
    if (!lab.objectiveCommands || lab.objectiveCommands.length !== lab.objectives.length) {
      labIssues.missingObjectiveCommands = Array.from(
        { length: lab.objectives.length },
        (_, i) => i
      ).filter(i => !lab.objectiveCommands?.[i] || lab.objectiveCommands[i].length === 0);
    }

    // Check terminal outputs
    for (const cmd of lab.commands) {
      const cmdStr = typeof cmd === 'string' ? cmd : cmd.command;
      if (!OUTPUTS[cmdStr] && !Object.keys(OUTPUTS).some(pattern => cmdStr.includes(pattern))) {
        labIssues.missingTerminalOutputs.push(cmdStr);
      }
    }

    if (labIssues.missingObjectiveCommands.length > 0 || labIssues.missingTerminalOutputs.length > 0) {
      issues.push(labIssues);
    }
  }

  return issues;
}
```

### Step 2: Generate Fixes for seed.js
For each lab with issues:
1. Map commands[i] to objectiveCommands[i]
2. Use command prefix as trigger (first 3-4 words)
3. Handle special cases (multiple commands per objective)

### Step 3: Add Missing Terminal Outputs
For each missing command:
1. Identify command type (show, config, debug)
2. Generate appropriate Cisco IOS output
3. Include keywords from objective text

### Step 4: End-to-End Testing
For each lab:
1. Start lab
2. Execute all Useful Commands in order
3. Verify completedObjectives.length === objectives.length
4. Verify score === 100
5. Verify lab status === "completed"

---

## Data Structures

### Audit Report Format
```json
{
  "totalLabs": 46,
  "labsWithIssues": 23,
  "issues": [
    {
      "labId": "lab-m1-1",
      "name": "OSI & TCP/IP Model Identification",
      "objectivesCount": 5,
      "commandsCount": 5,
      "objectiveCommandsCount": 5,
      "missingObjectiveCommands": [],
      "missingTerminalOutputs": ["show version"]
    }
  ]
}
```

### Fixed Lab Definition
```javascript
{
  labId: "lab-m1-1",
  objectives: [
    "Identify all 7 OSI layers and their primary functions",
    "Map TCP/IP layers to corresponding OSI layers",
    "Use show version to identify device hardware (Layer 1)",
    "Use show interfaces to view Layer 2 MAC addresses and encapsulation",
    "Use show arp to view Layer 3 address mappings"
  ],
  commands: [
    "show version",
    "show interfaces",
    "show ip interface brief",
    "show arp",
    "show mac address-table"
  ],
  objectiveCommands: [
    ["show version"],
    ["show ip interface brief"],
    ["show version"],
    ["show interfaces"],
    ["show arp"]
  ]
}
```

---

## Correctness Properties

### P1: Command Coverage
**Property**: Every Useful Command in every lab produces non-empty output in terminal-engine.js.
**Test**: Execute all commands from all labs, verify output !== "".

### P2: Objective Mapping
**Property**: Every objective has at least one trigger in objectiveCommands.
**Test**: For all labs, objectiveCommands.length === objectives.length AND all entries are non-empty arrays.

### P3: Trigger Matching
**Property**: Every Useful Command matches at least one objective trigger.
**Test**: For all labs, executing all commands completes all objectives.

### P4: Score Accuracy
**Property**: Score = (completedObjectives.length / totalObjectives) × 100.
**Test**: Complete 3/5 objectives → score === 60; complete 5/5 → score === 100.

### P5: Completion Status
**Property**: When score === 100, lab status === "completed".
**Test**: Complete all objectives → verify status === "completed" in database.

### P6: Click-to-Execute
**Property**: Clicking a Useful Command executes it immediately without manual Enter.
**Test**: Click command → verify terminal shows output within 200ms.

---

## Testing Strategy

### Unit Tests
1. Test objective validator with various command patterns
2. Test score calculation with different completion ratios
3. Test terminal engine output generation

### Integration Tests
1. Test full lab flow: start → execute commands → verify objectives → submit
2. Test SSE events for objective completion
3. Test score persistence to database

### End-to-End Tests
1. For each lab:
   - Start lab
   - Click all Useful Commands in order
   - Verify all objectives complete
   - Verify score === 100
   - Verify status === "completed"

### Regression Tests
1. Verify existing completed labs are not affected
2. Verify leaderboard updates correctly
3. Verify achievements unlock correctly

---

## Rollout Plan

### Phase 1: Audit (Non-Destructive)
- Run audit script
- Generate report
- Review with stakeholders

### Phase 2: Fix Definitions (Database Update)
- Update seed.js with corrected objectiveCommands
- Run seed script to update database
- Verify no data loss

### Phase 3: Fix Terminal Engine (Code Update)
- Add missing command outputs
- Deploy to staging
- Test all labs

### Phase 4: Fix Frontend (Code Update)
- Verify click-to-execute works
- Deploy to staging
- Test user flow

### Phase 5: Production Deployment
- Deploy all changes together
- Monitor error logs
- Run smoke tests on production

### Phase 6: Validation
- Test random sample of 10 labs
- Verify 100% completion achievable
- Monitor user feedback

---

## Maintenance

### Adding New Labs
1. Define objectives and commands
2. Generate objectiveCommands from commands
3. Add terminal outputs for new commands
4. Test end-to-end before deploying

### Modifying Existing Labs
1. Update objectives text (safe)
2. Update commands (requires objectiveCommands update)
3. Update objectiveCommands (requires testing)
4. Never change scoring formula

---

## Notes

- All changes are backward-compatible
- Existing completed labs are not affected
- No database migrations required (seed script handles updates)
- Frontend changes are minimal (click-to-execute already works)
- Terminal engine is extensible (easy to add new commands)
