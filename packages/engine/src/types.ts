export type SimulationStateStatus = 
  | 'INIT'
  | 'SCENARIO_LOADED'
  | 'OPENING'
  | 'WAITING_FOR_USER'
  | 'TURN_EVALUATION'
  | 'PRESSURE_UPDATE'
  | 'PERSONA_DECISION'
  | 'AI_RESPONSE'
  | 'OBJECTIVE_UPDATE'
  | 'CHECK_TERMINATION'
  | 'COMPLETED'
  | 'EVALUATING'
  | 'SCORED'
  | 'FEEDBACK_READY'
  | 'PAUSE'
  | 'SAFETY_INTERRUPT'
  | 'ERROR'
  | 'ABORT';

export interface ScenarioState {
  id: string;
  title: string;
  difficulty: number;
  premium: boolean;
  userRole: string;
  aiRole: string;
  userObjective: string;
  personaObjective: string;
  openingLine: string;
  pressureProfile: {
    start: number;
    max: number;
  };
  successCriteria: string[];
  failureCriteria: string[];
  scoringWeights?: {
    clarity: number;
    empathy: number;
    boundaries: number;
    assertiveness: number;
    evidence?: number;
  };
  behavioralPolicies: {
    tactics: string[];
    escalationTriggers: string[];
    deescalationTriggers: string[];
  };
}

export interface PersonaState {
  emotion: string;
  tactic: string;
}

export interface PressureState {
  level: number;
  trend: -1 | 0 | 1;
  cooldownTurns: number;
}

export interface TurnSignals {
  clarity: number;
  empathy: number;
  boundaryStrength: number;
  aggression: number;
  evidenceQuality: number;
}

export interface TurnState {
  speaker: 'USER' | 'AI';
  content: string;
  signals?: TurnSignals;
  pressureLevelAtTurn: number;
  turnNumber: number;
}

export interface EvaluationState {
  score: number;
  metrics?: {
    clarity: number;
    empathy: number;
    boundaries: number;
    assertiveness: number;
  };
  feedback: {
    strengths: string[];
    weaknesses: string[];
    turningPoint: string;
    nextAttemptGoal: string;
  };
  successMet?: boolean;
  failureMet?: boolean;
  falsifiedAssumptions?: { assumption: string; reality: string; turnIndex: number | null }[];
  evaluationDegraded?: boolean;
};
}

export interface SimulationState {
  id: string;
  status: SimulationStateStatus;
  scenario: ScenarioState;
  persona: PersonaState;
  pressure: PressureState;
  turns: TurnState[];
  previousAttempts?: string[]; // Anti-duplication logs from previous sessions
  attemptNumber: number; // Current attempt sequence number for tactic rotation
  evaluation?: EvaluationState;
  maxTurns: number;
}

