const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'packages', 'scenarios', 'src', 'data.ts');
let dataFile = fs.readFileSync(dataPath, 'utf-8');
const startIndex = dataFile.indexOf('[');
const endIndex = dataFile.lastIndexOf(']');
const dataStr = dataFile.substring(startIndex, endIndex + 1);
const scenarios = JSON.parse(dataStr);

const requiredFields = ['id', 'title', 'category', 'difficulty', 'userObjective', 'personaObjective', 'successCriteria', 'failureCriteria', 'behavioralPolicies', 'safetyClass'];

let missingFields = 0;
let duplicateTactics = 0;
const counts = { Workplace: 0, Relationships: 0, Commercial: 0, Crisis: 0 };
const seenTactics = new Set();

scenarios.forEach(s => {
  if (counts[s.category] !== undefined) counts[s.category]++;
  requiredFields.forEach(f => {
    if (s[f] === undefined) {
      console.error('Missing field', f, 'in scenario', s.id);
      missingFields++;
    }
  });
  
  if (s.behavioralPolicies && Array.isArray(s.behavioralPolicies.tactics)) {
    const tacticStr = [...s.behavioralPolicies.tactics].sort().join('|');
    if (seenTactics.has(tacticStr)) {
      console.error('Duplicate tactics found in scenario', s.id);
      duplicateTactics++;
    } else {
      seenTactics.add(tacticStr);
    }
  }
});

console.log('Total Scenarios:', scenarios.length);
console.log('Category Counts:', counts);
console.log('Undefined/Missing Required Fields:', missingFields);
console.log('Scenarios with Duplicated Tactics:', duplicateTactics);

