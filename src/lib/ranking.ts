import { BASE_ELO } from "./elo";

/**
 * Ranking rules (agreed spec):
 * - Base rating 1400 (FIDE floor), documented as the standard.
 * - Order: Elo desc -> wins desc -> total battles desc -> name A-Z.
 * - Display: competition ranking with letter suffixes (#1, #2A, #2B, #4A, #4B, #6).
 *   Rows tied on ALL criteria share a number; letters follow A-Z order;
 *   the next distinct rank skips consumed numbers.
 * - Tiers: bronze->diamond by Elo bands (tunable below); Grandmaster =
 *   first 20 display rows of the (filtered) board meeting the battles gate.
 */

export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Grandmaster";

export interface TierBand {
  tier: Exclude<Tier, "Grandmaster">;
  minElo: number;
}

export const TIER_BANDS: TierBand[] = [
  { tier: "Diamond", minElo: 1800 },
  { tier: "Platinum", minElo: 1600 },
  { tier: "Gold", minElo: 1400 },
  { tier: "Silver", minElo: 1200 },
  { tier: "Bronze", minElo: -Infinity },
];

/** Rows of Grandmaster shown per board. */
export const GRANDMASTER_ROWS = 20;
/** Minimum battles to be GM-eligible (keeps 1-0 newcomers out). Tunable. */
export const GRANDMASTER_MIN_BATTLES = 5;

export function tierFor(elo: number): Exclude<Tier, "Grandmaster"> {
  return TIER_BANDS.find((b) => elo >= b.minElo)!.tier;
}

export interface BoardInput {
  id: string;
  name: string;
  elo: number;
  wins: number;
  battles: number;
}

export interface BoardRow extends BoardInput {
  /** Competition-rank label, e.g. "1", "2A", "4B". */
  rank: string;
  tier: Tier;
}

function tieKey(r: BoardInput): string {
  return `${r.elo}|${r.wins}|${r.battles}`;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function letterSuffix(i: number): string {
  let s = "";
  let n = i;
  do {
    s = LETTERS[n % 26] + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

export function buildBoard(entries: BoardInput[]): BoardRow[] {
  const sorted = [...entries].sort(
    (a, b) =>
      b.elo - a.elo ||
      b.wins - a.wins ||
      b.battles - a.battles ||
      a.name.localeCompare(b.name)
  );

  // Competition rank numbers: first row of each tie group gets position+1.
  const rankNumbers: number[] = [];
  let groupStart = 0;
  sorted.forEach((e, i) => {
    if (i > 0 && tieKey(e) !== tieKey(sorted[i - 1])) groupStart = i;
    rankNumbers.push(groupStart + 1);
  });

  const rows: (BoardRow & { rankNumber: number })[] = sorted.map((e, i) => ({
    ...e,
    rankNumber: rankNumbers[i],
    rank: "",
    tier: tierFor(e.elo),
  }));

  // Letter suffixes within each tie group (already A-Z ordered by sort).
  const groupSizes = new Map<number, number>();
  for (const r of rows) groupSizes.set(r.rankNumber, (groupSizes.get(r.rankNumber) ?? 0) + 1);
  const groupSeen = new Map<number, number>();
  for (const r of rows) {
    const size = groupSizes.get(r.rankNumber)!;
    if (size === 1) {
      r.rank = String(r.rankNumber);
    } else {
      const n = groupSeen.get(r.rankNumber) ?? 0;
      groupSeen.set(r.rankNumber, n + 1);
      r.rank = `${r.rankNumber}${letterSuffix(n)}`;
    }
  }

  // Grandmaster: first GRANDMASTER_ROWS eligible display rows.
  // A tie group straddling the cutoff is never split. Group members share
  // battles through tieKey, so eligibility is uniform within a group.
  let gmCount = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.battles < GRANDMASTER_MIN_BATTLES) continue;
    const continuesGroup =
      i > 0 && rows[i - 1].tier === "Grandmaster" && tieKey(r) === tieKey(rows[i - 1]);
    if (gmCount < GRANDMASTER_ROWS || continuesGroup) {
      r.tier = "Grandmaster";
      gmCount++;
    } else {
      break;
    }
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    elo: r.elo,
    wins: r.wins,
    battles: r.battles,
    rank: r.rank,
    tier: r.tier,
  }));
}

export { BASE_ELO };
