import { sql } from "@vercel/postgres";
import type { Rating } from "@/data/types";
import { BASE_ELO, updateElo } from "./elo";

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

function fresh(): Rating {
  return { elo: BASE_ELO, wins: 0, losses: 0, battles: 0 };
}

export async function getAllRatings(): Promise<Record<string, Rating>> {
  const { rows } = await sql`SELECT id, elo, wins, losses, battles FROM ratings`;
  const out: Record<string, Rating> = {};
  for (const r of rows) {
    out[r.id as string] = {
      elo: Number(r.elo),
      wins: Number(r.wins),
      losses: Number(r.losses),
      battles: Number(r.battles),
    };
  }
  return out;
}

async function getOne(id: string): Promise<Rating> {
  const { rows } = await sql`SELECT elo, wins, losses, battles FROM ratings WHERE id = ${id}`;
  if (!rows.length) return fresh();
  const r = rows[0];
  return { elo: Number(r.elo), wins: Number(r.wins), losses: Number(r.losses), battles: Number(r.battles) };
}

/** Applies one vote server-side. Note: read-modify-write (fine at prototype scale). */
export async function recordVote(
  winnerId: string,
  loserId: string
): Promise<Record<string, Rating>> {
  const w = await getOne(winnerId);
  const l = await getOne(loserId);
  const next = updateElo(w.elo, l.elo);
  const winner: Rating = { elo: next.winner, wins: w.wins + 1, losses: w.losses, battles: w.battles + 1 };
  const loser: Rating = { elo: next.loser, wins: l.wins, losses: l.losses + 1, battles: l.battles + 1 };
  await sql`
    INSERT INTO ratings (id, elo, wins, losses, battles, updated_at)
    VALUES (${winnerId}, ${winner.elo}, ${winner.wins}, ${winner.losses}, ${winner.battles}, NOW()),
           (${loserId}, ${loser.elo}, ${loser.wins}, ${loser.losses}, ${loser.battles}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      elo = EXCLUDED.elo, wins = EXCLUDED.wins,
      losses = EXCLUDED.losses, battles = EXCLUDED.battles,
      updated_at = NOW()
  `;
  return { [winnerId]: winner, [loserId]: loser };
}
