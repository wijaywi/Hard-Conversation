import fs from 'fs';
import path from 'path';
import { SimulationState } from '../../../packages/engine/src/types';

const DB_PATH = path.join(__dirname, '..', 'database.json');

export interface ScenarioResult {
  score: number;
  attemptNumber: number;
  timestamp: string;
}

export interface DatabaseSchema {
  simulations: Record<string, SimulationState>;
  users: Record<string, {
    id: string;
    unlockedLevel: number;
    scenarioHistory: Record<string, ScenarioResult[]>;
    scenarioTactics: Record<string, string[]>;
  }>;
}

if (!fs.existsSync(DB_PATH)) {
  const initialData: DatabaseSchema = { simulations: {}, users: {} };
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

class JSONDatabase {
  private readDB(): DatabaseSchema {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  }

  private writeDB(data: DatabaseSchema): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  public getSimulation(id: string): SimulationState | null {
    const db = this.readDB();
    return db.simulations[id] || null;
  }

  public saveSimulation(id: string, state: SimulationState): void {
    const db = this.readDB();
    db.simulations[id] = state;
    this.writeDB(db);
  }

  public getUserProgression(userId: string) {
    const db = this.readDB();
    if (!db.users[userId]) {
      return { unlockedLevel: 1, averageVelocity: 0, scenarioHistory: {} };
    }
    const user = db.users[userId];
    
    // Calculate global average velocity
    let totalVelocity = 0;
    let scenariosWithVelocity = 0;
    
    for (const [scenId, history] of Object.entries(user.scenarioHistory)) {
      if (history.length > 1) {
        const firstScore = history[0].score;
        const lastScore = history[history.length - 1].score;
        totalVelocity += (lastScore - firstScore);
        scenariosWithVelocity++;
      }
    }
    
    const averageVelocity = scenariosWithVelocity > 0 ? totalVelocity / scenariosWithVelocity : 0;
    
    return {
      unlockedLevel: user.unlockedLevel || 1,
      averageVelocity,
      scenarioHistory: user.scenarioHistory
    };
  }

  public getUserAttemptCount(userId: string, scenarioId: string): number {
    const db = this.readDB();
    if (!db.users[userId]) return 0;
    if (!db.users[userId].scenarioHistory) return 0;
    return db.users[userId].scenarioHistory[scenarioId]?.length || 0;
  }

  public getPreviousTactics(userId: string, scenarioId: string): string[] {
    const db = this.readDB();
    if (!db.users[userId]) return [];
    if (!db.users[userId].scenarioTactics) db.users[userId].scenarioTactics = {};
    return db.users[userId].scenarioTactics[scenarioId] || [];
  }

  public logAttempt(userId: string, scenarioId: string, usedTactic: string | undefined, score: number): void {
    const db = this.readDB();
    if (!db.users[userId]) {
      db.users[userId] = { 
        id: userId, 
        unlockedLevel: 1, 
        scenarioHistory: {}, 
        scenarioTactics: {} 
      };
    }
    
    const user = db.users[userId];
    
    // Migrate old format if needed
    if (!user.scenarioHistory) user.scenarioHistory = {};
    if (!user.scenarioTactics) user.scenarioTactics = {};
    if (!user.unlockedLevel) user.unlockedLevel = 1;
    
    if (!user.scenarioHistory[scenarioId]) {
      user.scenarioHistory[scenarioId] = [];
    }
    
    if (!user.scenarioTactics[scenarioId]) {
      user.scenarioTactics[scenarioId] = [];
    }
    
    const attemptNumber = user.scenarioHistory[scenarioId].length + 1;
    
    user.scenarioHistory[scenarioId].push({
      score,
      attemptNumber,
      timestamp: new Date().toISOString()
    });
    
    if (usedTactic && !user.scenarioTactics[scenarioId].includes(usedTactic)) {
      user.scenarioTactics[scenarioId].push(usedTactic);
    }
    
    // Gating check: if they have at least 2 scenarios in Level N with score >= 70, unlock N+1
    let highScores = 0;
    for (const [_, history] of Object.entries(user.scenarioHistory)) {
      if (history.some(h => h.score >= 70)) {
        highScores++;
      }
    }
    
    const newLevel = Math.min(5, 1 + Math.floor(highScores / 2));
    if (newLevel > user.unlockedLevel) {
      user.unlockedLevel = newLevel;
    }
    
    this.writeDB(db);
  }
}

export const db = new JSONDatabase();
