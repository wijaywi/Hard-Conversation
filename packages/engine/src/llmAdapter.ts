import { ScenarioState, PersonaState, PressureState, TurnSignals, TurnState, SimulationState } from './types';

// This file defines the LLM prompting architecture and strict JSON schemas.

/**
 * 1. TURN ANALYSIS
 * Evaluates the user's message to extract measurable signals.
 * The deterministic engine will use these signals to update pressure and state.
 */
export function buildTurnAnalysisPrompt(
  scenario: ScenarioState,
  userMessage: string,
  history: TurnState[]
): { system: string; user: string } {
  const systemPrompt = `You are the Signal Extraction Engine for the Hard Conversation Simulator.
Your job is to objectively analyze the user's latest response.
You must return a valid JSON object matching the schema below. Do not return markdown, only JSON.

Scenario Context:
- User Role: ${scenario.userRole}
- User Objective: ${scenario.userObjective}

JSON Schema:
{
  "signals": {
    "clarity": 0.0 to 1.0 (How direct and unambiguous was the user?),
    "empathy": 0.0 to 1.0 (Did the user acknowledge the persona's feelings or constraints?),
    "boundaryStrength": 0.0 to 1.0 (Did the user firmly hold their objective?),
    "aggression": 0.0 to 1.0 (Was the user hostile, insulting, or overly combative?),
    "evidenceQuality": 0.0 to 1.0 (Did the user provide logical reasoning or data?)
  },
  "detected_events": [string] (e.g., "user_yielded", "user_proposed_alternative", "user_escalated"),
  "confidence": 0.0 to 1.0 (Your confidence in this analysis)
}`;

  const userPrompt = `History (last 3 turns):
${formatHistory(history.slice(-3))}

User's Latest Message: "${userMessage}"

Analyze the user's message and return the JSON.`;

  return { system: systemPrompt, user: userPrompt };
}

/**
 * 2. PERSONA RESPONSE GENERATION
 * Generates what the AI says next, strictly bounded by the current pressure and persona state.
 */
export function buildPersonaResponsePrompt(
  scenario: ScenarioState,
  persona: PersonaState,
  pressure: PressureState,
  history: TurnState[],
  previousAttempts: string[] = []
): { system: string; user: string } {
  const previousResponses = previousAttempts.length > 0 
    ? `\nANTI-DUPLICATION: You have already tried the following responses in previous sessions. Do NOT repeat these lines:\n- ${previousAttempts.join('\n- ')}` 
    : '';

  const systemPrompt = `You are the Persona Generation Engine for the Hard Conversation Simulator.
You are roleplaying as: ${scenario.aiRole}
Your Objective: ${scenario.personaObjective}
Hidden Constraints: ${scenario.hiddenConstraints}

Current Pressure Level: ${pressure.level} / ${scenario.pressureProfile.max}
Pressure Guide:
1 = Calm, logical, open to evidence.
2 = Resistant, skeptical, demands proof.
3 = Defensive, redirects blame, guarded.
4 = Hostile, aggressive tone, issues ultimatums.
5 = Brutal, unreasonable, manipulative.

Your Current Assigned Tactic for this Session:
- MUST USE TACTIC: "${persona.tactic}"
You must heavily lean into this tactic to achieve your objective.

Escalation Triggers (If the user does these, increase your pressure/hostility):
- ${scenario.behavioralPolicies.escalationTriggers.join('\n- ')}

Current Persona Emotion: ${persona.emotion}
Current Tactic: ${persona.tactic}${previousResponses}

Rules:
1. You MUST push back against the user based on the Pressure Level.
2. DO NOT be helpful unless the user has completely cornered you with evidence and empathy.
3. Keep your response concise, realistic, and conversational (under 50 words).
4. Return ONLY valid JSON matching the schema below.

JSON Schema:
{
  "intent": "string" (What are you trying to do? e.g., "deflect_blame", "demand_compliance"),
  "emotion": "string" (Your current emotional state),
  "speech": "string" (The exact words you say to the user)
}`;

  const userPrompt = `History:
${formatHistory(history.slice(-5))}

Generate your next response as JSON.`;

  return { system: systemPrompt, user: userPrompt };
}

/**
 * 3. EVALUATION
 * Runs at the end of the simulation to provide structured qualitative feedback.
 */
export function buildEvaluationPrompt(
  simulation: SimulationState
): { system: string; user: string } {
  const systemPrompt = `You are the Evaluation Engine for the Hard Conversation Simulator.
The simulation is complete. You must evaluate the user's performance objectively.

Scenario Objective: ${simulation.scenario.userObjective}
Success Criteria: ${simulation.scenario.successCriteria.join(', ')}
Failure Criteria: ${simulation.scenario.failureCriteria.join(', ')}

Evaluate the outcomes first, then formulate 'falsifiedAssumptions' based on the result:
- If failureMet is true: Identify a flawed assumption the user held (e.g., assuming aggression equals authority) and the reality of why it backfired.
- If successMet is true: Identify a critical hidden constraint or true assumption the user successfully exposed/leveraged to win.
- If both are false (ambiguous/mixed performance): Identify one assumption they held that worked in their favor, and one assumption that hindered their overall progress, reflecting their mixed performance.

You MUST provide at least one item in 'falsifiedAssumptions' following the above rules.
You must return valid JSON matching the schema below. Cite specific turns as evidence.

JSON Schema:
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "turningPoint": "string" (Identify the critical moment/turn that defined the outcome),
  "nextAttemptGoal": "string" (Actionable advice for their next retry),
  "successMet": boolean,
  "failureMet": boolean,
  "falsifiedAssumptions": [{
    "assumption": "string",
    "reality": "string",
    "turnIndex": number | null
  }]
}`;

  const userPrompt = `Full Conversation Transcript:
${formatHistory(simulation.turns)}

Evaluate the user's performance and return the JSON.`;

  return { system: systemPrompt, user: userPrompt };
}

// Helper to format history for the prompt
function formatHistory(turns: TurnState[]): string {
  if (turns.length === 0) return "No history yet.";
  return turns.map(t => `[Turn ${t.turnNumber}] ${t.speaker}: ${t.content}`).join('\n');
}

