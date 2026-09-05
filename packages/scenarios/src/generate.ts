import fs from 'fs';
import path from 'path';

const categories = ['Workplace', 'Relationships', 'Commercial', 'Crisis'];
const templates = [
  // Workplace
  { id: 'scn_wk_1', title: 'Say no to weekend work', diff: 1, p: false },
  { id: 'scn_wk_2', title: 'Salary Negotiation', diff: 2, p: false },
  { id: 'scn_wk_3', title: 'Report Harassment', diff: 3, p: false },
  { id: 'scn_wk_4', title: 'Fire an underperformer', diff: 4, p: true },
  { id: 'scn_wk_5', title: 'Resign to angry boss', diff: 5, p: true },
  { id: 'scn_wk_6', title: 'Reject unsafe project', diff: 2, p: false },
  { id: 'scn_wk_7', title: 'Confront idea thief', diff: 3, p: false },
  { id: 'scn_wk_8', title: 'Ask for mental health leave', diff: 1, p: false },
  { id: 'scn_wk_9', title: 'Push back on scope creep', diff: 2, p: false },
  { id: 'scn_wk_10', title: 'Manage defensive peer', diff: 4, p: true },
  // Relationships
  { id: 'scn_rl_1', title: 'Family loan rejection', diff: 1, p: false },
  { id: 'scn_rl_2', title: 'Breakup long term', diff: 3, p: false },
  { id: 'scn_rl_3', title: 'Addiction intervention', diff: 5, p: true },
  { id: 'scn_rl_4', title: 'Boundary with in-laws', diff: 2, p: false },
  { id: 'scn_rl_5', title: 'Confronting cheating', diff: 4, p: true },
  { id: 'scn_rl_6', title: 'Cancel wedding', diff: 5, p: true },
  { id: 'scn_rl_7', title: 'Refuse holiday trip', diff: 1, p: false },
  { id: 'scn_rl_8', title: 'Address unequal chores', diff: 2, p: false },
  { id: 'scn_rl_9', title: 'Discussing prenup', diff: 3, p: false },
  { id: 'scn_rl_10', title: 'Confront lying friend', diff: 2, p: false },
  // Commercial
  { id: 'scn_cm_1', title: 'Debt collector haggle', diff: 3, p: false },
  { id: 'scn_cm_2', title: 'Medical bill dispute', diff: 4, p: true },
  { id: 'scn_cm_3', title: 'Cancel gym membership', diff: 1, p: false },
  { id: 'scn_cm_4', title: 'Eviction notice dispute', diff: 5, p: true },
  { id: 'scn_cm_5', title: 'Refund from scam', diff: 3, p: false },
  // Crisis
  { id: 'scn_cr_1', title: 'Confronting a thief', diff: 4, p: true },
  { id: 'scn_cr_2', title: 'Aggressive neighbor', diff: 3, p: false },
  { id: 'scn_cr_3', title: 'Car accident fault', diff: 2, p: false },
  { id: 'scn_cr_4', title: 'Hostile police stop', diff: 5, p: true },
  { id: 'scn_cr_5', title: 'Public harassment', diff: 4, p: true }
];

const scenarios = templates.map(t => ({
  id: t.id,
  title: t.title,
  category: t.id.includes('wk') ? 'Workplace' : t.id.includes('rl') ? 'Relationships' : t.id.includes('cm') ? 'Commercial' : 'Crisis',
  difficulty: t.diff,
  premium: t.p,
  userRole: 'Protagonist',
  aiRole: 'Antagonist',
  userObjective: 'Hold the line firmly',
  personaObjective: 'Break the user\'s boundaries',
  hiddenConstraints: 'Will only yield if user provides overwhelming logic or strong emotional boundary.',
  openingLine: 'What do you want? I don\'t have all day.',
  pressureProfile: { start: Math.max(1, t.diff - 1), max: t.diff + 1 },
  successCriteria: ['State boundary clearly', 'Do not yield'],
  failureCriteria: ['Yield to demands', 'Lose temper'],
  scoringWeights: { clarity: 0.3, empathy: 0.2, boundaries: 0.3, assertiveness: 0.2, evidence: 0.0 },
  safetyClass: t.diff >= 4 ? 'HIGH_RISK' : 'DIFFICULT_BUT_ALLOWED',
  behavioralPolicies: {
    tactics: ['Gaslighting', 'Guilt Tripping', 'Stonewalling', 'Intimidation'],
    escalationTriggers: ['User stammers', 'User apologizes repeatedly'],
    deescalationTriggers: ['User states indisputable facts', 'User shows extreme empathy']
  }
}));

const outPath = path.join(__dirname, 'data.ts');
fs.writeFileSync(outPath, 'export const scenarios = ' + JSON.stringify(scenarios, null, 2) + ';');

