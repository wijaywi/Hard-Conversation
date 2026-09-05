import test from 'node:test';
import assert from 'node:assert';
import { getInCharacterFallback } from '../src/fallback';
import { SimulationState } from '../src/types';

function createMockState(category: string, turnsLength: number, tactics: string[]): SimulationState {
  return {
    scenario: {
      category,
      behavioralPolicies: { tactics }
    },
    turns: new Array(turnsLength).fill({})
  } as unknown as SimulationState;
}

test('Fallback: Deterministic selection of intent based on turns length', () => {
  const tactics = ['TacticA', 'TacticB', 'TacticC'];
  
  const stateTurn0 = createMockState('Workplace', 0, tactics);
  const result0 = getInCharacterFallback(stateTurn0);
  assert.strictEqual(result0.intent, 'TacticA', '0 % 3 = 0 -> TacticA');

  const stateTurn1 = createMockState('Workplace', 1, tactics);
  const result1 = getInCharacterFallback(stateTurn1);
  assert.strictEqual(result1.intent, 'TacticB', '1 % 3 = 1 -> TacticB');
  
  const stateTurn4 = createMockState('Workplace', 4, tactics);
  const result4 = getInCharacterFallback(stateTurn4);
  assert.strictEqual(result4.intent, 'TacticB', '4 % 3 = 1 -> TacticB');
});

test('Fallback: Returns correct template for each category', () => {
  const tactics = ['TacticA'];
  
  const workplace = getInCharacterFallback(createMockState('Workplace', 0, tactics));
  assert.strictEqual(workplace.speech, "Saya tidak punya waktu berdebat soal ini. Keputusan sudah final.");

  const crisis = getInCharacterFallback(createMockState('Crisis', 0, tactics));
  assert.strictEqual(crisis.speech, "Lu jangan macem-macem sama gue! Minggir atau urusannya makin panjang!");

  const relations = getInCharacterFallback(createMockState('Relationships', 0, tactics));
  assert.strictEqual(relations.speech, "Kamu selalu aja begini, memutarbalikkan fakta. Aku lelah bahas ini.");

  const commercial = getInCharacterFallback(createMockState('Commercial', 0, tactics));
  assert.strictEqual(commercial.speech, "Sesuai prosedur yang berlaku, itu tidak bisa dibatalkan. Ada keluhan lain?");
});
