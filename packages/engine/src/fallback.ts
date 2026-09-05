import { SimulationState, TurnSignals } from './types';

export function getInCharacterFallback(state: SimulationState): { speech: string; intent: string; emotion: string } {
  const category = state.scenario.category;
  const tactics = state.scenario.behavioralPolicies.tactics;
  
  const tacticIndex = state.turns.length % tactics.length;
  const selectedTactic = tactics[tacticIndex];

  let fallbackSpeech = '';
  
  switch (category) {
    case 'Workplace':
      fallbackSpeech = 'Saya tidak punya waktu berdebat soal ini. Keputusan sudah final.';
      break;
    case 'Crisis':
      fallbackSpeech = 'Lu jangan macem-macem sama gue! Minggir atau urusannya makin panjang!';
      break;
    case 'Relationships':
      fallbackSpeech = 'Kamu selalu aja begini, memutarbalikkan fakta. Aku lelah bahas ini.';
      break;
    case 'Commercial':
      fallbackSpeech = 'Sesuai prosedur yang berlaku, itu tidak bisa dibatalkan. Ada keluhan lain?';
      break;
    default:
      fallbackSpeech = 'Saya tidak setuju. Kita sudahi saja pembicaraan ini.';
  }

  return {
    speech: fallbackSpeech,
    intent: selectedTactic,
    emotion: 'frustrated'
  };
}

export function getFallbackSignals(): TurnSignals {
  // Deterministic neutral/baseline signals if Turn Analysis LLM fails
  return {
    clarity: 0.5,
    empathy: 0.5,
    boundaryStrength: 0.5,
    aggression: 0.0,
    evidenceQuality: 0.5
  };
}
