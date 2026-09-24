/** Elo rating, Facemash-style. K=32 is standard for casual ladders. */
export const K_FACTOR = 32;
export const BASE_ELO = 1400;

export function expectedScore(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

export function updateElo(winnerElo: number, loserElo: number, k = K_FACTOR) {
  const expectedWin = expectedScore(winnerElo, loserElo);
  const expectedLose = expectedScore(loserElo, winnerElo);
  return {
    winner: Math.round(winnerElo + k * (1 - expectedWin)),
    loser: Math.round(loserElo + k * (0 - expectedLose)),
  };
}

export function pickPair(ids: string[], avoidId?: string): [string, string] {
  if (ids.length < 2) throw new Error("Need at least 2 characters to vote");
  let a = ids[Math.floor(Math.random() * ids.length)];
  let b = ids[Math.floor(Math.random() * ids.length)];
  let guard = 0;
  while ((b === a || (avoidId && (a === avoidId || b === avoidId))) && guard++ < 50) {
    a = ids[Math.floor(Math.random() * ids.length)];
    b = ids[Math.floor(Math.random() * ids.length)];
  }
  if (b === a) b = ids[(ids.indexOf(a) + 1) % ids.length];
  return [a, b];
}
