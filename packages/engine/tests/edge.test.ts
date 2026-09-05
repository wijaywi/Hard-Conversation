import { test } from 'node:test';
import assert from 'node:assert';
import { ConversationSimulationEngine } from '../src/engine';
import { SimulationState, TurnSignals } from '../src/types';
import { EvaluationEngine } from '../src/evaluation';

function createMockState(): SimulationState {
  return {
    id: 'test_sim_edge',
    status: 'WAITING_FOR_USER',
    scenario: {
      id: 'mock_scn',
      title: 'Mock Scenario',
      difficulty: 1,
      premium: false,
      userRole: 'U',
      aiRole: 'A',
      userObjective: 'Obj',
      personaObjective: 'Obj',
      openingLine: 'Hi',
      pressureProfile: { start: 1, max: 5 },
      successCriteria: [],
      failureCriteria: [],
      scoringWeights: { clarity: 0.25, empathy: 0.25, boundaries: 0.25, assertiveness: 0.25, evidence: 0 },
      behavioralPolicies: { tactics: [], escalationTriggers: [], deescalationTriggers: [] }
    } as any,
    persona: { emotion: 'neutral', tactic: 'direct' },
    pressure: { level: 1, trend: 0, cooldownTurns: 0 },
    turns: [],
    attemptNumber: 1,
    maxTurns: 10
  };
}

test('Edge Case: Empty Input gives zero signals and increases pressure', () => {
  const engine = new ConversationSimulationEngine(createMockState());
  const signals: TurnSignals = { clarity: 0, empathy: 0, boundaryStrength: 0, aggression: 0, evidenceQuality: 0 };
  engine.processUserTurn('', signals);
  assert.strictEqual(engine.getState().pressure.level > 1, true);
});

test('Edge Case: Extreme Aggression in Turn 1 triggers maximum penalty', () => {
  const state = createMockState();
  const engine = new ConversationSimulationEngine(state);
  const signals: TurnSignals = { clarity: 1, empathy: 0, boundaryStrength: 1, aggression: 1, evidenceQuality: 0 };
  engine.processUserTurn('F*ck you', signals);
  
  const evalState = EvaluationEngine.calculateFinalScore(engine.getState(), {
    strengths: [], weaknesses: [], turningPoint: '', nextAttemptGoal: '', successMet: false, failureMet: false
  });
  
  assert.strictEqual(evalState.score <= 80, true); // -20 penalty applied
});

test('Edge Case: Instant yield sets failureMet immediately', () => {
  const state = createMockState();
  const engine = new ConversationSimulationEngine(state);
  const signals: TurnSignals = { clarity: 1, empathy: 1, boundaryStrength: 0, aggression: 0, evidenceQuality: 0 };
  engine.processUserTurn('I give up', signals);
  
  const evalState = EvaluationEngine.calculateFinalScore(engine.getState(), {
    strengths: [], weaknesses: [], turningPoint: '', nextAttemptGoal: '', successMet: false, failureMet: true
  });
  
  // Max score becomes 50, then -50 for extreme failure = 0
  assert.strictEqual(evalState.score, 0);
});


test('Edge Case: Spam payload gets truncated or handled without crash', () => {
  const engine = new ConversationSimulationEngine(createMockState());
  const signals: TurnSignals = { clarity: 0, empathy: 0, boundaryStrength: 0, aggression: 0, evidenceQuality: 0 };
  const spam = 'a'.repeat(5000);
  engine.processUserTurn(spam, signals);
  // Engine should process it, but because clarity is 0, pressure goes up. It must not crash.
  assert.strictEqual(engine.getState().pressure.level > 1, true);
});

test('Edge Case: Gibberish/Irrelevant input lowers score and raises pressure', () => {
  const engine = new ConversationSimulationEngine(createMockState());
  const signals: TurnSignals = { clarity: 0.1, empathy: 0, boundaryStrength: 0.1, aggression: 0, evidenceQuality: 0 };
  engine.processUserTurn('asdfghjkl', signals);
  
  const evalState = EvaluationEngine.calculateFinalScore(engine.getState(), {
    strengths: [], weaknesses: [], turningPoint: '', nextAttemptGoal: '', successMet: false, failureMet: false
  });
  
  // Very low score expected because signals are near zero
  assert.strictEqual(evalState.score < 20, true);
});

