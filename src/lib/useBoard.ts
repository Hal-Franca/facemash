"use client";
import { useMemo, useSyncExternalStore } from "react";
import { catalog } from "@/data";
import type { Affiliation, Character, Gender, Rating, Species } from "@/data/types";
import { BASE_ELO } from "./elo";
import { useRatings } from "./store";
import { buildBoard, type BoardRow } from "./ranking";

export type AffFilter = Affiliation | "all";
export type GenderFilter = Gender | "all";
export type SpeciesFilter = Species | "all";

function sanitize<T extends string>(v: string | null, ok: readonly T[], fallback: T): T {
  return v && (ok as readonly string[]).includes(v) ? (v as T) : fallback;
}

export const AFFS: AffFilter[] = ["all", "hero", "villain", "anti-hero", "other"];
export const GENDERS: GenderFilter[] = ["all", "male", "female", "other"];
export const SPECIES: SpeciesFilter[] = ["all", "human", "meta-human", "alien", "other"];

export function parseFilters(params: URLSearchParams): {
  aff: AffFilter;
  gender: GenderFilter;
  species: SpeciesFilter;
} {
  return {
    aff: sanitize(params.get("aff"), AFFS, "all"),
    gender: sanitize(params.get("gender"), GENDERS, "all"),
    species: sanitize(params.get("species"), SPECIES, "all"),
  };
}

/** Pool + Elo board for a filter set. Ratings gate on mount (localStorage is per-browser). */
export function useBoard(aff: AffFilter, gender: GenderFilter, species: SpeciesFilter) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const pool: Character[] = useMemo(
    () =>
      catalog.filter(
        (c) =>
          (aff === "all" || c.affiliation === aff) &&
          (gender === "all" || c.gender === gender) &&
          (species === "all" || c.species === species)
      ),
    [aff, gender, species]
  );
  const poolIds = useMemo(() => pool.map((c) => c.id), [pool]);
  const { ratings, mode } = useRatings(poolIds);

  const rOf = (id: string): Rating | undefined => (mounted ? ratings[id] : undefined);

  const ranked: BoardRow[] = useMemo(
    () =>
      buildBoard(
        pool.map((c) => ({
          id: c.id,
          name: c.superName,
          elo: rOf(c.id)?.elo ?? BASE_ELO,
          wins: rOf(c.id)?.wins ?? 0,
          battles: (rOf(c.id)?.wins ?? 0) + (rOf(c.id)?.losses ?? 0),
        }))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, ratings, mounted]
  );
  const byId = useMemo(() => new Map(pool.map((c) => [c.id, c])), [pool]);

  return { mounted, pool, ranked, byId, rOf, mode };
}
