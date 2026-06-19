/**
 * Lab Audit Script
 * 
 * This script audits all labs in the database to identify:
 * - Labs with missing or incomplete objectiveCommands arrays
 * - Commands that don't have corresponding terminal outputs in terminal-engine.js
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import Lab from './schemas/lab.model.js';
import { OUTPUTS } from '../modules/labs/terminal-engine.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Audits all labs to identify mapping issues between objectives, commands, and terminal outputs
 * @returns {Promise<Object>} Audit report with summary and issues
 */
export async function auditLabs() {
  // Task 1.2: Fetch all labs from database
  const labs = await Lab.find().lean();
  
  const issues = [];
  
  for (const lab of labs) {
    // Task 1.2: Extract lab data
    const labId = lab.labId;
    const name = lab.name;
    const objectives = lab.objectives || [];
    const commands = lab.commands || [];
    const objectiveCommands = lab.objectiveCommands || [];
    
    // Count arrays
    const objectivesCount = objectives.length;
    const commandsCount = commands.length;
    const objectiveCommandsCount = objectiveCommands.length;
    
    const labIssues = {
      labId,
      name,
      objectivesCount,
      commandsCount,
      objectiveCommandsCount,
      missingObjectiveCommands: [],
      missingTerminalOutputs: [],
    };
    
    // Task 1.3: Validate objectiveCommands array
    // Check if objectiveCommands exists and has correct length
    if (objectiveCommandsCount !== objectivesCount) {
      // Flag all objectives that don't have corresponding triggers
      for (let i = 0; i < objectivesCount; i++) {
        if (!objectiveCommands[i] || objectiveCommands[i].length === 0) {
          labIssues.missingObjectiveCommands.push(i);
        }
      }
    } else {
      // Even if length matches, check for empty entries
      for (let i = 0; i < objectivesCount; i++) {
        if (!objectiveCommands[i] || objectiveCommands[i].length === 0) {
          labIssues.missingObjectiveCommands.push(i);
        }
      }
    }
    
    // Task 1.4: Validate terminal output coverage
    for (const cmd of commands) {
      const cmdStr = typeof cmd === 'string' ? cmd : cmd.command || cmd;
      
      // Check exact match in OUTPUTS
      let hasOutput = OUTPUTS[cmdStr] !== undefined;
      
      // Check pattern match (command includes any OUTPUTS key)
      if (!hasOutput) {
        hasOutput = Object.keys(OUTPUTS).some(pattern => 
          cmdStr.includes(pattern) || pattern.includes(cmdStr)
        );
      }
      
      if (!hasOutput) {
        labIssues.missingTerminalOutputs.push(cmdStr);
      }
    }
    
    // Only add to issues if there are actual problems
    if (labIssues.missingObjectiveCommands.length > 0 || 
        labIssues.missingTerminalOutputs.length > 0) {
      issues.push(labIssues);
    }
  }
  
  // Task 1.5: Generate audit report
  const report = {
    totalLabs: labs.length,
    labsWithIssues: issues.length,
    issues,
  };
  
  return report;
}


// Task 2.1: Main execution block
async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartitlab';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully\n');
    
    // Run audit
    console.log('Running lab audit...');
    const report = await auditLabs();
    
    // Task 1.5: Save report to JSON file
    const reportPath = path.join(__dirname, 'audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\nAudit report saved to: ${reportPath}`);
    
    // Log summary to console
    console.log('\n=== AUDIT SUMMARY ===');
    console.log(`Total Labs: ${report.totalLabs}`);
    console.log(`Labs with Issues: ${report.labsWithIssues}`);
    console.log(`Labs without Issues: ${report.totalLabs - report.labsWithIssues}`);
    
    if (report.labsWithIssues > 0) {
      console.log('\n=== ISSUES BREAKDOWN ===');
      let totalMissingObjectiveCommands = 0;
      let totalMissingTerminalOutputs = 0;
      
      for (const issue of report.issues) {
        totalMissingObjectiveCommands += issue.missingObjectiveCommands.length;
        totalMissingTerminalOutputs += issue.missingTerminalOutputs.length;
        
        console.log(`\n${issue.labId} - ${issue.name}`);
        console.log(`  Objectives: ${issue.objectivesCount}, Commands: ${issue.commandsCount}, ObjectiveCommands: ${issue.objectiveCommandsCount}`);
        
        if (issue.missingObjectiveCommands.length > 0) {
          console.log(`  Missing ObjectiveCommands for objectives: ${issue.missingObjectiveCommands.join(', ')}`);
        }
        
        if (issue.missingTerminalOutputs.length > 0) {
          console.log(`  Missing Terminal Outputs (${issue.missingTerminalOutputs.length}):`);
          issue.missingTerminalOutputs.forEach(cmd => {
            console.log(`    - ${cmd}`);
          });
        }
      }
      
      console.log('\n=== TOTALS ===');
      console.log(`Total Missing ObjectiveCommands: ${totalMissingObjectiveCommands}`);
      console.log(`Total Missing Terminal Outputs: ${totalMissingTerminalOutputs}`);
    } else {
      console.log('\n✓ All labs are properly configured!');
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error running audit:', error);
    process.exit(1);
  }
}

// Run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
