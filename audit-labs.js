/**
 * Audit script: reads seed.js and reports labs where
 * commands.length < objectives.length (can't reach 100%)
 */
import { readFileSync } from 'fs';
import { createRequire } from 'module';

// We'll parse the seed file by extracting lab data via regex
const content = readFileSync('./SmartBackend/src/database/seed.js', 'utf8');

// Extract all labId occurrences and their commands/objectives counts
const labIdMatches = [...content.matchAll(/labId:"(lab-[^"]+)"/g)];

console.log('Labs found:', labIdMatches.length);

// For each lab, find its objectives and commands arrays
for (const match of labIdMatches) {
  const labId = match[1];
  const pos = match.index;
  
  // Get a chunk of text after this labId (up to next labId or end)
  const nextLabPos = content.indexOf('labId:', pos + 10);
  const chunk = nextLabPos > 0 ? content.slice(pos, nextLabPos) : content.slice(pos, pos + 3000);
  
  // Count objectives
  const objMatch = chunk.match(/objectives:\[([^\]]+)\]/);
  const objCount = objMatch ? (objMatch[1].match(/"/g) || []).length / 2 : '?';
  
  // Count commands  
  const cmdMatch = chunk.match(/commands:\[([^\]]+)\]/);
  const cmdCount = cmdMatch ? (cmdMatch[1].match(/"/g) || []).length / 2 : '?';
  
  // Check objectiveCommands
  const hasObjCmds = chunk.includes('objectiveCommands:');
  
  if (typeof objCount === 'number' && typeof cmdCount === 'number' && cmdCount < objCount) {
    console.log(`⚠️  ${labId}: ${cmdCount} commands < ${objCount} objectives — NEEDS FIX`);
  } else {
    console.log(`✅ ${labId}: ${cmdCount} commands, ${objCount} objectives${hasObjCmds ? '' : ' [NO objectiveCommands]'}`);
  }
}
