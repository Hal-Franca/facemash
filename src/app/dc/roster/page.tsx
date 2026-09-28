"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { FilterSelect } from "@/components/FilterSelect";
import { AffiliationBadge, CharacterPortrait, hasRealName } from "@/components/CharacterCard";
import {
  parseFilters,
  useBoard,
  type AffFilter,
  type GenderFilter,
  type SpeciesFilter,
} from "@/lib/useBoard";

type Sort = "rank" | "az" | "za";

function RosterInner() {
  const params = useSearchParams();
  const initial = useMemo(() => parseFilters(params), [params]);
  const [aff, setAff] = useState<AffFilter>(initial.aff);
  const [gender, setGender] = useState<GenderFilter>(initial.gender);
  const [species, setSpecies] = useState<SpeciesFilter>(initial.species);
  const [sort, setSort] = useState<Sort>("rank");
  const [query, setQuery] = useState("");

  const { ranked, byId } = useBoard(aff, gender, species);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? ranked.filter((r) => {
          const c = byId.get(r.id)!;
          return (
            c.superName.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
          );
        })
      : [...ranked];
    if (sort !== "rank") {
      rows.sort((a, b) => {
        const an = byId.get(a.id)!.superName;
        const bn = byId.get(b.id)!.superName;
        return sort === "az" ? an.localeCompare(bn) : bn.localeCompare(an);
      });
    }
    return rows;
  }, [ranked, byId, sort, query]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6">
      <SiteHeader />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Roster ({shown.length})</h1>
          <p className="opacity-70">Every character, with rank. Click a card for the full profile.</p>
        </div>
        <FilterSelect label="Sort" value={sort} onChange={(v) => setSort(v as Sort)}>
          <option value="rank">Rank</option>
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
        </FilterSelect>
      </div>

      <section className="mt-4 grid gap-3 rounded-2xl border p-4 sm:grid-cols-3">
        <div className="flex items-center justify-between sm:col-span-3">
          <p className="text-sm font-semibold opacity-70">Filters</p>
          {(aff !== "all" || gender !== "all" || species !== "all" || query.trim() !== "") && (
            <button
              onClick={() => {
                setAff("all");
                setGender("all");
                setSpecies("all");
                setQuery("");
              }}
              className="rounded-full border px-3 py-1 text-xs"
            >
              Clear ✕
            </button>
          )}
        </div>
        <FilterSelect label="Affiliation" value={aff} onChange={(v) => setAff(v as AffFilter)}>
          <option value="all">All</option>
          <option value="hero">Hero</option>
          <option value="anti-hero">Anti-hero</option>
          <option value="villain">Villain</option>
          <option value="other">Other</option>
        </FilterSelect>
        <FilterSelect label="Gender" value={gender} onChange={(v) => setGender(v as GenderFilter)}>
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </FilterSelect>
        <FilterSelect label="Species" value={species} onChange={(v) => setSpecies(v as SpeciesFilter)}>
          <option value="all">All</option>
          <option value="human">Human</option>
          <option value="meta-human">Meta-human</option>
          <option value="alien">Alien</option>
          <option value="other">Other</option>
        </FilterSelect>
        <label className="flex flex-col gap-1 text-sm sm:col-span-3">
          Search
          <span className="relative block">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Super name or real name…"
              className="w-full rounded-lg border border-zinc-300 bg-white p-2 pr-10 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </span>
        </label>
      </section>

      <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {shown.map((r) => {
          const c = byId.get(r.id)!;
          return (
            <li key={c.id}>
              <Link
                href={`/dc/characters/${c.id}`}
                className="block rounded-2xl border p-3 hover:border-zinc-500"
              >
                <CharacterPortrait c={c} />
                <p className="mt-2 truncate text-center text-sm font-bold">
                  #{r.rank} · {c.superName}{hasRealName(c) && (
                    <span className="font-normal opacity-60"> ({c.name})</span>
                  )}
                </p>
                <p className="mt-1 flex items-center justify-center gap-2">
                  <AffiliationBadge value={c.affiliation} />
                  <span className="text-xs capitalize opacity-60">{c.species}</span>
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

export default function RosterPage() {
  return (
    <Suspense>
      <RosterInner />
    </Suspense>
  );
}
