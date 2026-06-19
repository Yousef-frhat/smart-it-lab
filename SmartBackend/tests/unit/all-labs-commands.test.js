/**
 * Unit Test: All Labs Commands
 * Tests that every command in every lab's commands[] array executes successfully
 * and that running all objectiveCommands completes all objectives (100% score).
 */

import { describe, it, expect } from '@jest/globals';
import { executeCommand, evaluateObjectives } from '../../src/modules/labs/terminal-engine.js';
import { LABS } from '../../src/database/seed.js';

describe('All Labs Commands Test', () => {
  console.log(`Loaded ${LABS.length} labs for testing`);

  describe('Command Execution Tests', () => {
    LABS.forEach((lab) => {
      describe(`Lab: ${lab.labId} - ${lab.name}`, () => {
        it('should execute all commands without errors', () => {
          const failedCommands = [];
          
          lab.commands.forEach((command) => {
            const result = executeCommand(command, 'Router-1', {});
            
            if (!result || result.isError || typeof result.output !== 'string') {
              failedCommands.push({
                command,
                result: result || { output: '', isError: true }
              });
            }
          });

          if (failedCommands.length > 0) {
            console.error(`\n❌ Lab ${lab.labId} failed commands:`, failedCommands);
          }

          expect(failedCommands).toHaveLength(0);
        });

        it('should complete all objectives when running objectiveCommands (100% score)', () => {
          const totalObjectives = lab.objectives.length;
          const commandHistory = [];
          
          // Simulate running all commands that match objective patterns
          lab.objectiveCommands.forEach((commandPatterns, objectiveIndex) => {
            commandPatterns.forEach((pattern) => {
              // Find commands that match this pattern
              const matchingCommands = lab.commands.filter(cmd => {
                const cmdLower = cmd.toLowerCase();
                const patternLower = pattern.toLowerCase();
                return cmdLower.includes(patternLower) || patternLower.includes(cmdLower);
              });

              // Add matching commands to history
              matchingCommands.forEach((command) => {
                const result = executeCommand(command, 'Router-1', {});
                if (result && !result.isError) {
                  commandHistory.push(command);
                }
              });
            });
          });

          // Use evaluateObjectives to calculate score
          const completedObjectives = evaluateObjectives(
            lab.objectives,
            lab.objectiveCommands,
            commandHistory,
            []
          );

          const score = (completedObjectives.length / totalObjectives) * 100;
          
          if (score < 100) {
            console.error(`\n❌ Lab ${lab.labId} incomplete objectives:`);
            console.error(`Score: ${score}% (${completedObjectives.length}/${totalObjectives} objectives)`);
            console.error(`Completed objectives:`, completedObjectives);
            console.error(`Command history:`, commandHistory);
          }

          expect(score).toBe(100);
        });
      });
    });
  });
});
