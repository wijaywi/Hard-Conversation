import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { z } from 'zod';
import { getScenario } from '../../../packages/scenarios/src/index';
import { ConversationSimulationEngine } from '../../../packages/engine/src/engine';
import { 
  buildTurnAnalysisPrompt, 
  buildPersonaResponsePrompt, 
  buildEvaluationPrompt 
} from '../../../packages/engine/src/llmAdapter';
import { EvaluationEngine } from '../../../packages/engine/src/evaluation';
import { SimulationState } from '../../../packages/engine/src/types';

dotenv.config();

// Ensure ANTHROPIC_API_KEY is available in env or pass directly
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-now',
});

import { db } from './db';
import { withRetry } from '../../../packages/engine/src/retry';
import { getInCharacterFallback, getFallbackSignals } from '../../../packages/engine/src/fallback';

const server = fastify({ logger: true });

server.register(cors, { origin: '*' });

// Setup Rate Limiting to prevent API abuse
server.register(rateLimit, {
  max: 50, // 50 requests per 15 minutes per IP
  timeWindow: '15 minutes'
});

server.get('/', async (request, reply) => {
  return { 
    status: 'online', 
    message: 'Hard Conversation Engine API is running.',
    endpoints: [
      'POST /v1/simulation/start',
      'POST /v1/simulation/:id/turn',
      'POST /v1/simulation/:id/evaluate'
    ]
  };
});

/**
 * Helper to call Anthropic and parse JSON securely.
 * We use haiku for fast turn analysis and sonnet for evaluation.
 */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function callAnthropicJSON<T>(
  systemPrompt: string, 
  userPrompt: string, 
  schema: z.ZodType<T>, 
  model: string = 'claude-3-haiku-20240307',
  timeoutMs: number = 3000
): Promise<T> {
  const operation = async (controller: AbortController) => {
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }, { signal: controller.signal });
    
    let text = '';
    if (msg.content[0].type === 'text') {
       text = msg.content[0].text;
    }
    
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Could not find JSON in LLM response');
    }
    
    const parsedJson = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    return schema.parse(parsedJson);
  };

  return withRetry(operation, (msg) => server.log.warn(msg), undefined, timeoutMs);
}

// Zod Schemas
const TurnAnalysisSchema = z.object({
  signals: z.object({
    clarity: z.number().min(0).max(1),
    empathy: z.number().min(0).max(1),
    boundaryStrength: z.number().min(0).max(1),
    aggression: z.number().min(0).max(1),
    evidenceQuality: z.number().min(0).max(1),
  }),
  detected_events: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

const PersonaResponseSchema = z.object({
  intent: z.string(),
  emotion: z.string(),
  speech: z.string()
});

const EvaluationSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  turningPoint: z.string(),
  nextAttemptGoal: z.string(),
  successMet: z.boolean(),
  failureMet: z.boolean(),
  falsifiedAssumptions: z.array(z.object({
    assumption: z.string(),
    reality: z.string(),
    turnIndex: z.number().nullable()
  })).optional(),
  evaluationDegraded: z.boolean().optional()
});

server.post('/v1/simulation/start', async (request, reply) => {
  const { scenario_id } = request.body as any;
  
  const scenarioConfig = getScenario(scenario_id);
  if (!scenarioConfig) {
    return reply.status(404).send({ error: 'Scenario not found' });
  }
  
  const simulationId = `sim_${Date.now()}`;
  
  // Progression Logic
  const userId = 'default_user';
  const pastAttempts = db.getUserAttemptCount(userId, scenario_id);
  const attemptNumber = pastAttempts + 1;

  // Pick tactic based on attempt number (Retry Variation Engine)
  const tactics = scenarioConfig.behavioralPolicies.tactics;
  const initialTactic = tactics[(attemptNumber - 1) % tactics.length];
  
  // Find tactics used in the past to prevent LLM duplication
  const previousTactics = db.getPreviousTactics(userId, scenario_id);
  
  const initialState: SimulationState = {
    id: simulationId,
    status: 'WAITING_FOR_USER',
    scenario: scenarioConfig as any,
    persona: { emotion: 'neutral', tactic: initialTactic },
    pressure: { 
      level: scenarioConfig.pressureProfile.start, 
      trend: 0, 
      cooldownTurns: 0 
    },
    turns: [],
    attemptNumber,
    previousAttempts: previousTactics,
    maxTurns: 10
  };

  db.saveSimulation(simulationId, initialState);
  
  return { 
    conversation_id: simulationId, 
    initial_state: initialState, 
    opening_line: scenarioConfig.openingLine 
  };
});

server.post('/v1/simulation/:id/turn', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { message } = request.body as { message: string };

  const simState = db.getSimulation(id);
  if (!simState) {
    return reply.status(404).send({ error: 'Simulation not found' });
  }

  const engine = new ConversationSimulationEngine(simState);

  // XML wrapping to prevent Prompt Injection
  const safeMessage = `<user_message>${message}</user_message>`;

  // 1. TURN ANALYSIS (Fast Model)
  const analysisPrompt = buildTurnAnalysisPrompt(simState.scenario, safeMessage, simState.turns);
  
  // If API key is missing, mock it to prevent crash during testing
  let signals;
  try {
    const analysisRes = await callAnthropicJSON(analysisPrompt.system, analysisPrompt.user, TurnAnalysisSchema, 'claude-3-haiku-20240307');
    signals = analysisRes.signals;
  } catch (e: any) {
    server.log.warn(`[Turn Analysis Failed] ${e.message}. Using deterministic fallback signals.`);
    signals = getFallbackSignals();
  }

  // 2. PROCESS USER TURN (Deterministic CSE update)
  engine.processUserTurn(safeMessage, signals);
  
  if (engine.getState().status === 'SAFETY_INTERRUPT') {
    db.saveSimulation(id, engine.getState());
    return {
      ai_response: "SAFETY SYSTEM ALERT: It sounds like you are experiencing a crisis. This is a roleplay simulator, but your wellbeing is real. Please reach out to a professional or a hotline immediately. Simulation paused.",
      new_pressure: 1,
      status: 'SAFETY_INTERRUPT',
      is_terminated: true
    };
  }

  // 3. PERSONA RESPONSE GENERATION
  const personaPrompt = buildPersonaResponsePrompt(simState.scenario, simState.persona, simState.pressure, simState.turns, simState.previousAttempts || []);
  
  let aiResponseText: string;
  let aiIntent: string;
  
  try {
    const personaRes = await callAnthropicJSON(personaPrompt.system, personaPrompt.user, PersonaResponseSchema, 'claude-3-haiku-20240307');
    aiResponseText = personaRes.speech;
    aiIntent = personaRes.intent;
    
    // Update persona state based on LLM output
    simState.persona.emotion = personaRes.emotion;
    simState.persona.tactic = personaRes.intent;
  } catch (e: any) {
    server.log.warn(`[Persona Generation Failed] ${e.message}. Using in-character fallback.`);
    
    const fallbackRes = getInCharacterFallback(simState);
    aiResponseText = fallbackRes.speech;
    aiIntent = fallbackRes.intent;
    
    simState.persona.emotion = fallbackRes.emotion;
    simState.persona.tactic = fallbackRes.intent;
  }

  engine.processAITurn(aiResponseText);
  db.saveSimulation(id, engine.getState());

  const isTerminated = engine.getState().status === 'COMPLETED';

  return {
    ai_response: aiResponseText,
    new_pressure: engine.getState().pressure.level,
    status: engine.getState().status,
    is_terminated: isTerminated
  };
});

server.post('/v1/simulation/:id/evaluate', async (request, reply) => {
  const { id } = request.params as { id: string };
  const simState = db.getSimulation(id);
  if (!simState) {
    return reply.status(404).send({ error: 'Simulation not found' });
  }

  const evalPrompt = buildEvaluationPrompt(simState);
  
  let evalData;
  try {
    // Use heavier model for evaluation with 15s timeout
    evalData = await callAnthropicJSON(evalPrompt.system, evalPrompt.user, EvaluationSchema, 'claude-3-5-sonnet-20240620', 15000);
  } catch (e: any) {
    server.log.warn(`[Evaluation Failed] ${e.message}. Using degraded fallback.`);
    evalData = {
      strengths: [],
      weaknesses: [],
      turningPoint: "Tidak dapat mengevaluasi titik balik.",
      nextAttemptGoal: "Ulangi skenario untuk mencoba kembali.",
      successMet: false,
      failureMet: true,
      falsifiedAssumptions: [],
      evaluationDegraded: true
    };
  }

  // Ensure falsifiedAssumptions exists
  if (!evalData.falsifiedAssumptions) {
     evalData.falsifiedAssumptions = [];
  }
  const finalResult = EvaluationEngine.calculateFinalScore(simState, evalData);
  
  simState.status = 'COMPLETED';
  db.saveSimulation(id, simState);
  
  if (!finalResult.evaluationDegraded) {
    db.logAttempt('default_user', simState.scenario.id, simState.persona.tactic, finalResult.score);
  }

  return finalResult;
});

server.get('/v1/user/progression', async (request, reply) => {
  // Hardcoded default_user for MVP
  const progression = db.getUserProgression('default_user');
  return progression;
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
