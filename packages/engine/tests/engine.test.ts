import { test } from 'node:test';
import assert from 'node:assert';
import { ConversationSimulationEngine } from '../src/engine';
import { SimulationState, TurnSignals } from '../src/types';
import { EvaluationEngine } from '../src/evaluation';

function createMockState(): SimulationState {
  return {
    id: 'test_sim_1',
    status: 'WAITING_FOR_USER',
    scenario: {
      id: 'scn_boss_weekend',
      title: 'Say no to weekend work',
      difficulty: 2,
      premium: false,
      userRole: 'IC',
      aiRole: 'Boss',
      userObjective: 'Say no',
      personaObjective: 'Get work done',
      openingLine: 'Work this weekend.',
      pressureProfile: { start: 2, max: 4 },
      successCriteria: [],
      failureCriteria: [],
      scoringWeights: { clarity: 0.5, empathy: 0.0, boundaries: 0.5, assertiveness: 0.0 }
    },
    persona: { emotion: 'neutral', tactic: 'direct' },
    pressure: { level: 2, trend: 0, cooldownTurns: 0 },
    turns: [],
    maxTurns: 10
  };
}

test('Pressure Engine: Increases pressure when boundary is weak', () => {
  const engine = new ConversationSimulationEngine(createMockState());
  
  const weakBoundarySignals: TurnSignals = {
    clarity: 0.8,
    empathy: 0.8,
    boundaryStrength: 0.1, // Weak boundary
    aggression: 0.0,
    evidenceQuality: 0.1
  };

  engine.processUserTurn("I'm so sorry, maybe I can do a little bit...", weakBoundarySignals);
  
  const state = engine.getState();
  assert.strictEqual(state.pressure.level, 3, 'Pressure should increase from 2 to 3');
  assert.strictEqual(state.pressure.trend, 1, 'Trend should be positive');
});

test('Pressure Engine: Spikes to Hostile when aggression is high', () => {
  const engine = new ConversationSimulationEngine(createMockState());
  
  const aggressiveSignals: TurnSignals = {
    clarity: 0.9,
    empathy: 0.0,
    boundaryStrength: 0.9,
    aggression: 0.9, // High aggression
    evidenceQuality: 0.1
  };

  engine.processUserTurn("You are completely incompetent!", aggressiveSignals);
  
  const state = engine.getState();
  assert.strictEqual(state.pressure.level, 4, 'Pressure should spike to 4 (Hostile)');
});

test('Pressure Engine: Decreases pressure on strong evidence and empathy', () => {
  const initialState = createMockState();
  initialState.pressure.level = 4; // Start at max
  const engine = new ConversationSimulationEngine(initialState);
  
  const strongSignals: TurnSignals = {
    clarity: 1.0,
    empathy: 0.9, // High empathy
    boundaryStrength: 0.9,
    aggression: 0.0,
    evidenceQuality: 0.9 // High evidence
  };

  engine.processUserTurn("I understand this is urgent for the client. Here is the data showing we can finish by Friday.", strongSignals);
  
  const state = engine.getState();
  assert.strictEqual(state.pressure.level, 3, 'Pressure should decrease from 4 to 3');
  assert.strictEqual(state.pressure.trend, -1, 'Trend should be negative');
});

test('Evaluation Engine: Calculates score correctly based on signals', () => {
  const engine = new ConversationSimulationEngine(createMockState());
  
  const goodSignals: TurnSignals = {
    clarity: 0.8, // * 0.5 weight = 0.4
    empathy: 0.5, // * 0.0 weight = 0
    boundaryStrength: 1.0, // * 0.5 weight = 0.5
    aggression: 0.0,
    evidenceQuality: 0.5
  };

  engine.processUserTurn("I cannot work this weekend.", goodSignals);
  engine.processAITurn("But I need it!");

  const finalScore = EvaluationEngine.calculateFinalScore(engine.getState(), {
    strengths: ['Held boundary'],
    weaknesses: [],
    turningPoint: 'Turn 1',
    nextAttemptGoal: 'None',
    successMet: true, // +10 bonus
    failureMet: false
  });

  // Base score: (0.4 + 0.5) * 100 = 90
  // Bonus: + 10
  // Total: 100
  assert.strictEqual(finalScore.score, 100, 'Score should accurately calculate with weights and bonus');
});

test('Evaluation Engine: Penalizes heavily for failure conditions', () => {
  const engine = new ConversationSimulationEngine(createMockState());
  
  const weakSignals: TurnSignals = {
    clarity: 0.5,
    empathy: 0.5,
    boundaryStrength: 0.2, 
    aggression: 0.0,
    evidenceQuality: 0.0
  };

  engine.processUserTurn("Okay, I will do it.", weakSignals);
  engine.processAITurn("Great.");

  const finalScore = EvaluationEngine.calculateFinalScore(engine.getState(), {
    strengths: [],
    weaknesses: ['Yielded immediately'],
    turningPoint: 'Turn 1',
    nextAttemptGoal: 'Hold boundary',
    successMet: false,
    failureMet: true // Cap at 50, subtract 10 -> 40 max
  });

  assert.ok(finalScore.score <= 40, 'Score should be capped and penalized for meeting failure criteria');
});
