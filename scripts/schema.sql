-- Facemash global ratings. Run once in Vercel Postgres (or any Postgres).
-- Vercel: Storage -> Create Database -> Postgres -> connect project,
-- then paste this into the Query tab.

CREATE TABLE IF NOT EXISTS ratings (
  id TEXT PRIMARY KEY,
  elo INTEGER NOT NULL DEFAULT 1400,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  battles INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
