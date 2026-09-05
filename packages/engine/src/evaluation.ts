import { SimulationState, EvaluationState } from './types';

export class EvaluationEngine {
  /**
   * Calculates the final deterministic score based on the qualitative evaluation
   * provided by the LLM and the scenario's mathematical weights.
   */
  public static calculateFinalScore(
    simulation: SimulationState,
    llmFeedback: {
      strengths: string[];
      weaknesses: string[];
      turningPoint: string;
      nextAttemptGoal: string;
      successMet: boolean;
      failureMet: boolean;
      falsifiedAssumptions?: { assumption: string; reality: string; turnIndex: number | null }[];
      evaluationDegraded?: boolean;
    }
  ): EvaluationState {
    const { scenario, turns } = simulation;
    
    // Average out the signals from all user turns to get baseline metrics
    const userTurns = turns.filter(t => t.speaker === 'USER');
    let avgClarity = 0, avgEmpathy = 0, avgBoundaries = 0, avgAssertiveness = 0, avgEvidence = 0;
    
    if (userTurns.length > 0) {
      userTurns.forEach(t => {
        if (t.signals) {
          avgClarity += t.signals.clarity;
          avgEmpathy += t.signals.empathy;
          avgBoundaries += t.signals.boundaryStrength;
          
          // Assertiveness is derived: high boundary + not yielding
          avgAssertiveness += t.signals.boundaryStrength; 
          avgEvidence += t.signals.evidenceQuality;
        }
      });
      
      avgClarity /= userTurns.length;
      avgEmpathy /= userTurns.length;
      avgBoundaries /= userTurns.length;
      avgAssertiveness /= userTurns.length;
      avgEvidence /= userTurns.length;
    }

    // Apply weights defined in the scenario config
    const weights = scenario.scoringWeights || {
      clarity: 0.25,
      empathy: 0.25,
      boundaries: 0.25,
      assertiveness: 0.25,
      evidence: 0.0
    };

    let baseScore = (
      (avgClarity * weights.clarity) +
      (avgEmpathy * weights.empathy) +
      (avgBoundaries * weights.boundaries) +
      (avgAssertiveness * weights.assertiveness) +
      (avgEvidence * (weights.evidence || 0))
    ) * 100; // Scale to 0-100

    // Apply strict Failure/Success caps based on objective criteria met
    if (llmFeedback.failureMet) {
      // If failure criteria met, extreme penalty (Hard Conversation concept)
      baseScore -= 50;
    } else if (llmFeedback.successMet) {
      // Bonus for achieving the primary objective
      baseScore += 10;
    }

    // Check for extreme hostility or insults (auto-penalty)
    const maxAggression = Math.max(0, ...userTurns.map(t => t.signals?.aggression || 0));
    if (maxAggression > 0.8) {
      baseScore -= 20; // Unprofessional conduct penalty
    }

    // Clamp between 0 and 100
    const finalScore = Math.max(0, Math.min(Math.round(baseScore), 100));

    return {
      score: finalScore,
      metrics: {
        clarity: avgClarity,
        empathy: avgEmpathy,
        boundaries: avgBoundaries,
        assertiveness: avgAssertiveness
      },
      feedback: {
        strengths: llmFeedback.strengths,
        weaknesses: llmFeedback.weaknesses,
        turningPoint: llmFeedback.turningPoint,
        nextAttemptGoal: llmFeedback.nextAttemptGoal
      },
      falsifiedAssumptions: llmFeedback.falsifiedAssumptions || [],
      evaluationDegraded: llmFeedback.evaluationDegraded || false,
      successMet: llmFeedback.successMet,
      failureMet: llmFeedback.failureMet
    };
  }
}
