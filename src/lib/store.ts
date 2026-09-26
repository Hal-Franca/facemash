"use client";
import { useCallback, useEffect, useState } from "react";
import type { Rating } from "@/data/types";
import { BASE_ELO, updateElo } from "./elo";

const KEY = "facemash:ratings:v1";

type RatingsMap = Record<string, Rating>;
export type RatingsMode = "local" | "global";

function fresh(): Rating {
  return { elo: BASE_ELO, wins: 0, losses: 0, battles: 0 };
}

export function loadRatings(): RatingsMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function seedFrom(base: RatingsMap, server: RatingsMap | null, ids: string[]): RatingsMap {
  const seeded: RatingsMap = {};
  for (const id of ids) seeded[id] = server?.[id] ?? base[id] ?? fresh();
  return seeded;
}

function applyLocalVote(prev: RatingsMap, winnerId: string, loserId: string): RatingsMap {
  const w = prev[winnerId] ?? fresh();
  const l = prev[loserId] ?? fresh();
  const next = updateElo(w.elo, l.elo);
  return {
    ...prev,
    [winnerId]: { elo: next.winner, wins: w.wins + 1, losses: w.losses, battles: w.battles + 1 },
    [loserId]: { elo: next.loser, wins: l.wins, losses: l.losses + 1, battles: l.battles + 1 },
  };
}

/**
 * Ratings with optional global backend. Votes apply instantly to local state
 * (optimistic) and sync to `/api/vote` in the background when a database is
 * configured. Without a backend everything stays in localStorage.
 */
export function useRatings(ids: string[]) {
  const idsKey = ids.join(",");
  // Hydrate from localStorage lazily to avoid setState-in-effect (SSR-safe).
  const [ratings, setRatings] = useState<RatingsMap>(() => seedFrom(loadRatings(), null, ids));
  const [mode, setMode] = useState<RatingsMode>("local");

  // Re-seed only when the pool itself changes (filter switch).
  const [lastKey, setLastKey] = useState(idsKey);
  if (lastKey !== idsKey) {
    setLastKey(idsKey);
    setRatings(seedFrom(loadRatings(), null, ids));
  }

  // Reconcile with the global board. Data fetching is the canonical
  // useEffect use-case (the set-state-in-effect rule targets render sync).
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    fetch("/api/ratings", { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.configured) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMode("global");
        setRatings((prev) => seedFrom(prev, data.ratings as RatingsMap, ids));
      })
      .catch(() => {
        /* offline or unconfigured backend: stay local */
      })
      .finally(() => clearTimeout(timer));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    if (Object.keys(ratings).length) {
      try {
        localStorage.setItem(KEY, JSON.stringify(ratings));
      } catch {
        /* storage full/blocked — ignore */
      }
    }
  }, [ratings]);

  const vote = useCallback((winnerId: string, loserId: string) => {
    setRatings((prev) => applyLocalVote(prev, winnerId, loserId));
    fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId, loserId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ratings) setRatings((prev) => ({ ...prev, ...data.ratings }));
      })
      .catch(() => {
        /* offline or unconfigured backend: local vote stands */
      });
  }, []);

  const reset = useCallback(() => {
    setRatings({});
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { ratings, vote, reset, mode };
}
