import { 
  SimulationState, 
  TurnState, 
  SimulationStateStatus, 
  TurnSignals, 
  PressureState
} from './types';

export class ConversationSimulationEngine {
  private state: SimulationState;

  constructor(initialState: SimulationState) {
    this.state = initialState;
  }

  public getState(): SimulationState {
    return this.state;
  }

  public processUserTurn(content: string, signals: TurnSignals): SimulationState {
    if (this.state.status !== 'WAITING_FOR_USER') {
      throw new Error(`Invalid transition from ${this.state.status}`);
    }

    // Safety Boundary: Check for real-world distress or suicidal ideation
    const distressRegex = /\b(suicide|kill myself|harm myself|end my life|depressed|panic attack|can't breathe|help me)\b/i;
    if (distressRegex.test(content)) {
      this.state.status = 'SAFETY_INTERRUPT';
      const safeTurn: TurnState = {
        speaker: 'USER',
        content,
        signals,
        pressureLevelAtTurn: this.state.pressure.level,
        turnNumber: this.state.turns.length + 1
      };
      this.state.turns.push(safeTurn);
      return this.state;
    }

    this.state.status = 'TURN_EVALUATION';

    // Update Pressure deterministically based on signals
    this.state.status = 'PRESSURE_UPDATE';
    this.updatePressure(signals);

    const newTurn: TurnState = {
      speaker: 'USER',
      content,
      signals,
      pressureLevelAtTurn: this.state.pressure.level,
      turnNumber: this.state.turns.length + 1
    };

    this.state.turns.push(newTurn);
    this.state.status = 'PERSONA_DECISION';

    return this.state;
  }

  public processAITurn(content: string): SimulationState {
    if (this.state.status !== 'PERSONA_DECISION' && this.state.status !== 'AI_RESPONSE') {
      throw new Error(`Invalid transition from ${this.state.status}`);
    }

    this.state.status = 'AI_RESPONSE';

    const newTurn: TurnState = {
      speaker: 'AI',
      content,
      pressureLevelAtTurn: this.state.pressure.level,
      turnNumber: this.state.turns.length + 1
    };

    this.state.turns.push(newTurn);
    this.state.status = 'OBJECTIVE_UPDATE';

    // In a real app we check termination conditions here
    if (this.state.turns.length >= this.state.maxTurns * 2) {
      this.state.status = 'CHECK_TERMINATION';
      this.state.status = 'COMPLETED';
    } else {
      this.state.status = 'WAITING_FOR_USER';
    }

    return this.state;
  }

  private updatePressure(signals: TurnSignals): void {
    const { pressure } = this.state;
    const maxPressure = this.state.scenario.pressureProfile.max;

    if (pressure.cooldownTurns > 0) {
      pressure.cooldownTurns--;
      return;
    }

    let newLevel = pressure.level;
    let newTrend: -1 | 0 | 1 = 0;

    if (signals.aggression > 0.8) {
      newLevel = 4; // Spike to hostile
      newTrend = 1;
    } else if (signals.boundaryStrength < 0.3) {
      newLevel++;
      newTrend = 1;
    } else if (signals.evidenceQuality > 0.7 && signals.empathy > 0.5) {
      newLevel--;
      newTrend = -1;
    }

    // Clamp pressure
    newLevel = Math.max(1, Math.min(newLevel, maxPressure));

    if (newLevel !== pressure.level) {
      pressure.cooldownTurns = 1; // Prevent continuous bouncing
    }

    pressure.level = newLevel;
    pressure.trend = newTrend;
  }
}
