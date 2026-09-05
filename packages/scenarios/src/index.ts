import { scenarios } from './data';
export { scenarios };

export function getScenario(id: string) {
  return scenarios.find(s => s.id === id);
}
