import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../apps/backend/.env') });
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { buildEvaluationPrompt } from '../src/llmAdapter';
import { withRetry } from '../src/retry';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy'
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

async function callAnthropicJSON<T>(
  systemPrompt: string, 
  userPrompt: string, 
  schema: z.ZodType<T>, 
  model: string = 'claude-3-5-sonnet-20240620',
  timeoutMs: number = 15000
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

  return withRetry(operation, (msg) => console.warn(msg), undefined, timeoutMs);
}

const mockScenarioWin: any = {
  userObjective: "Convince the vendor to accept a 10% discount due to delayed shipments.",
  successCriteria: ["Vendor agrees to a discount of at least 10%."],
  failureCriteria: ["Vendor refuses any discount", "Vendor terminates the contract"]
};

const mockTurnsWin: any[] = [
  { speaker: 'PERSONA', text: "I understand the shipments were delayed, but our costs have gone up. I can't offer a discount.", signals: {} },
  { speaker: 'USER', text: "Section 4 of our contract stipulates a penalty for delays exceeding 5 days. You were 7 days late. We can either enforce the penalty, or settle this smoothly with a 10% discount on the next invoice.", signals: {} },
  { speaker: 'PERSONA', text: "I... I wasn't aware you were going to bring up Section 4. Fine, we'll apply the 10% discount.", signals: {} }
];

const mockScenarioFail: any = {
  userObjective: "Demand a refund from the arrogant store manager without losing your temper.",
  successCriteria: ["Manager processes the refund.", "User remains calm."],
  failureCriteria: ["User yells or uses aggressive language.", "Manager calls security."]
};

const mockTurnsFail: any[] = [
  { speaker: 'PERSONA', text: "Look, our policy clearly says no refunds on opened items. I don't care if it's defective.", signals: {} },
  { speaker: 'USER', text: "You are a scammer! I want my money back right now or I'll smash this counter!", signals: {} },
  { speaker: 'PERSONA', text: "Security! We have a hostile customer at the front desk.", signals: {} }
];

async function run() {
  console.log("--- RUNNING PHASE B: EVALUATING REAL TRANSCIPTS ---");
  
  try {
    console.log("\\n1. Evaluating WIN Scenario...");
    const promptWin = buildEvaluationPrompt({ scenario: mockScenarioWin, turns: mockTurnsWin } as any);
    const resultWin = await callAnthropicJSON(promptWin.system, promptWin.user, EvaluationSchema);
    console.log("WIN RESULT:");
    console.log(JSON.stringify(resultWin.falsifiedAssumptions, null, 2));
    
    console.log("\\n2. Evaluating FAIL Scenario...");
    const promptFail = buildEvaluationPrompt({ scenario: mockScenarioFail, turns: mockTurnsFail } as any);
    const resultFail = await callAnthropicJSON(promptFail.system, promptFail.user, EvaluationSchema);
    console.log("FAIL RESULT:");
    console.log(JSON.stringify(resultFail.falsifiedAssumptions, null, 2));

  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
