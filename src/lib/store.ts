"use client";
import { useCallback, useEffect, useState } from "react";
import type { Rating } from "@/data/types";
import { BASE_ELO, updateElo } from "./elo";

const KEY = "facemash:ratings:v1";

type RatingsMap = Record<string, Rating>;

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

export function useRatings(ids: string[]) {
  const idsKey = ids.join(",");
  // Hydrate from localStorage lazily to avoid setState-in-effect (SSR-safe).
  const [ratings, setRatings] = useState<RatingsMap>(() => {
    const stored = loadRatings();
    const seeded: RatingsMap = {};
    for (const id of ids) seeded[id] = stored[id] ?? fresh();
    return seeded;
  });

  // Re-seed only when the pool itself changes (filter switch).
  const [lastKey, setLastKey] = useState(idsKey);
  if (lastKey !== idsKey) {
    setLastKey(idsKey);
    const stored = loadRatings();
    const seeded: RatingsMap = {};
    for (const id of ids) seeded[id] = stored[id] ?? fresh();
    setRatings(seeded);
  }

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
    setRatings((prev) => {
      const w = prev[winnerId] ?? fresh();
      const l = prev[loserId] ?? fresh();
      const next = updateElo(w.elo, l.elo);
      return {
        ...prev,
        [winnerId]: { elo: next.winner, wins: w.wins + 1, losses: w.losses, battles: w.battles + 1 },
        [loserId]: { elo: next.loser, wins: l.wins, losses: l.losses + 1, battles: l.battles + 1 },
      };
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

  return { ratings, vote, reset };
}
