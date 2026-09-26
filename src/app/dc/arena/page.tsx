"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { catalog } from "@/data";
import type { Affiliation, Character, Gender, Rating, Species } from "@/data/types";
import { BASE_ELO, pickPair } from "@/lib/elo";
import { useRatings } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { AffiliationBadge, CharacterPortrait, RankRow, StatCard, StatDetails, StatHeading } from "@/components/CharacterCard";
import { FilterSelect } from "@/components/FilterSelect";
import { SiteHeader } from "@/components/SiteHeader";
import { buildBoard } from "@/lib/ranking";

type AffFilter = Affiliation | "all";
type GenderFilter = Gender | "all";
type SpeciesFilter = Species | "all";

/** False on server + hydration render, true after mount. Gates randomness + localStorage reads. */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function SideCard({
  c,
  rating,
  flipEnabled,
  showBelow,
  onVote,
  skipLabel,
  onSkip,
  headerCls,
  portraitCls,
  belowCls,
}: {
  c: Character;
  rating: Rating | undefined;
  flipEnabled: boolean;
  showBelow: boolean;
  onVote: () => void;
  skipLabel: string;
  onSkip: () => void;
  headerCls: string;
  portraitCls: string;
  belowCls: string;
}) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const flipped = pinned || (flipEnabled && hover);
  const elo = rating?.elo ?? BASE_ELO;

  return (
    <>
      <div className={headerCls}>
        <p className="text-center text-lg font-bold">
          {c.superName} <span className="font-normal opacity-60">({c.name})</span>
        </p>
      </div>
      <div className={portraitCls} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <button onClick={onVote} className="block w-full text-left" aria-label={`Vote ${c.superName}`}>
        <div className="[perspective:1200px]">
          <div
            className="relative transition-transform duration-[400ms] [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <div className="[backface-visibility:hidden]">
              <CharacterPortrait c={c} priority />
            </div>
            {/* Back of card: shared stats block (dividers included) */}
            <div className="absolute inset-0 overflow-y-auto rounded-2xl border border-zinc-300 bg-zinc-100 p-4 text-left text-sm text-zinc-900 [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              <StatHeading c={c} />
              <hr className="my-2 border-zinc-300 dark:border-zinc-700" />
              <StatDetails c={c} elo={elo} />
            </div>
          </div>
        </div>
        </button>
      </div>
      <div className={belowCls}>
        <p className="mt-3 flex items-center justify-center gap-2">
          <AffiliationBadge value={c.affiliation} />
          <span className="text-sm capitalize opacity-60">{c.species}</span>
          <span
            role="button"
            tabIndex={0}
            title={pinned ? "Unpin stats" : "Pin stats on card"}
            aria-label={pinned ? `Unpin ${c.superName} stats` : `Pin ${c.superName} stats`}
            onClick={(e) => {
              e.stopPropagation();
              setPinned((p) => !p);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPinned((p) => !p);
              }
            }}
            className="cursor-pointer rounded-full border px-2 py-0.5 text-xs opacity-70 hover:opacity-100"
          >
            {pinned ? "📌 pinned" : "ⓘ stats"}
          </span>
        </p>
        {showBelow && <StatCard c={c} elo={elo} />}
        <p className="mt-3 text-center text-sm">
          <button onClick={onSkip} className="rounded-full border px-4 py-2">{skipLabel}</button>
        </p>
      </div>
    </>
  );
}

export default function Home() {
  const mounted = useMounted();
  const { theme, toggle } = useTheme();
  const [aff, setAff] = useState<AffFilter>("all");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [species, setSpecies] = useState<SpeciesFilter>("all");
  const [flipEnabled, setFlipEnabled] = useState(false);
  const [showBelow, setShowBelow] = useState(false);

  const pool = useMemo(
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

  const { ratings, vote, mode } = useRatings(poolIds);
  const [pair, setPair] = useState<[string, string] | null>(null);
  // Client-only randomness: null until mounted, so server + hydration HTML match.
  const activePair = useMemo(() => {
    if (!mounted || poolIds.length < 2) return null;
    if (!pair || !poolIds.includes(pair[0]) || !poolIds.includes(pair[1])) {
      return pickPair(poolIds);
    }
    return pair;
  }, [mounted, pair, poolIds]);

  const left = activePair ? pool.find((c) => c.id === activePair[0])! : null;
  const right = activePair ? pool.find((c) => c.id === activePair[1])! : null;

  const choose = (winnerId: string, loserId: string) => {
    vote(winnerId, loserId);
    setPair(pickPair(poolIds));
  };
  const skipBoth = () => setPair(pickPair(poolIds));
  const skipOne = (keepId: string) => {
    const others = poolIds.filter((id) => id !== keepId);
    if (!others.length) return;
    const next = others[Math.floor(Math.random() * others.length)];
    setPair(keepId === activePair?.[0] ? [keepId, next] : [next, keepId]);
  };

  // Ratings only render after mount (localStorage differs per browser).
  const rOf = (id: string): Rating | undefined => (mounted ? ratings[id] : undefined);
  // Board order: Elo -> wins -> battles -> A-Z, with letter-suffixed
  // competition ranks and SC2-style tiers (Grandmaster = top-20 rows).
  const ranked = useMemo(
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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6">
      <SiteHeader />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="opacity-70">
          Who wins? Click to vote. Elo-ranked, {mode === "global" ? "shared global board" : "stored locally"}.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFlipEnabled((s) => !s)} className="hidden rounded-full border px-4 py-2 text-sm lg:inline-block" aria-pressed={flipEnabled}>
            {flipEnabled ? "🂠 Flip: on" : "🂠 Flip: off"}
          </button>
          <button onClick={() => setShowBelow((s) => !s)} className="rounded-full border px-4 py-2 text-sm" aria-pressed={showBelow}>
            {showBelow ? "Stats below: on" : "Stats below: off"}
          </button>
          <button onClick={toggle} className="rounded-full border px-4 py-2 text-sm" aria-label="Toggle theme">
            {!mounted || theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
          <Link href="/dc/how-to-play" className="rounded-full border px-4 py-2 text-sm">
            ❓ How to play
          </Link>
        </div>
      </div>

      {/* Filters */}
      <section className="mt-6 grid gap-3 rounded-2xl border p-4 sm:grid-cols-3">
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
      </section>

      {/* Arena */}
      {left && right ? (
        <section className="mt-6">
          {/* R1: names. R2: portraits (+OR). R3: stats + per-card skips. Middle locked to the portraits. */}
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-[1fr_auto_1fr]">
            <SideCard
              c={left} rating={rOf(left.id)} flipEnabled={flipEnabled} showBelow={showBelow}
              onVote={() => choose(left.id, right.id)}
              skipLabel="Skip right (keep left)" onSkip={() => skipOne(left.id)}
              headerCls="order-1 sm:col-start-1 sm:row-start-1"
              portraitCls="order-2 sm:col-start-1 sm:row-start-2"
              belowCls="order-3 flex flex-col sm:order-6 sm:col-start-1 sm:row-start-3"
            />
            <div className="order-4 flex flex-col items-center justify-center gap-2 sm:col-start-2 sm:row-start-2 sm:min-w-28 sm:gap-3 sm:self-center">
              <div className="hidden font-black opacity-50 sm:block">OR</div>
              <div className="flex w-full items-center gap-3 sm:hidden">
                <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />
                <button onClick={skipBoth} className="shrink-0 rounded-full border px-4 py-2 text-sm">Skip both ⟳</button>
                <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />
              </div>
              <button onClick={skipBoth} className="hidden rounded-full border px-4 py-2 text-sm sm:inline-flex">Skip both ⟳</button>
            </div>
            <SideCard
              c={right} rating={rOf(right.id)} flipEnabled={flipEnabled} showBelow={showBelow}
              onVote={() => choose(right.id, left.id)}
              skipLabel="Skip left (keep right)" onSkip={() => skipOne(right.id)}
              headerCls="order-5 sm:col-start-3 sm:row-start-1"
              portraitCls="order-6 sm:col-start-3 sm:row-start-2"
              belowCls="order-7 flex flex-col sm:order-7 sm:col-start-3 sm:row-start-3"
            />
          </div>
        </section>
      ) : mounted ? (
        <p className="mt-6 rounded-2xl border p-6 text-center">Not enough characters for this filter — loosen it.</p>
      ) : (
        <section className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center" aria-busy="true" aria-label="Loading matchup">
          <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="pt-24 text-center font-black opacity-50 sm:pt-40">OR</div>
          <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </section>
      )}

      {/* Rankings: fixed top 20. Full browsing lives on /roster and /ladder. */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Top 20 ({ranked.length})</h2>
        <ol className="mt-3 grid gap-2 lg:grid-cols-2">
          {ranked.slice(0, 20).map((r) => {
            const c = byId.get(r.id)!;
            return (
              <RankRow
                key={c.id}
                rank={r.rank}
                c={c}
                elo={r.elo}
                wins={r.wins}
                losses={r.battles - r.wins}
              />
            );
          })}
        </ol>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          <Link
            href={`/dc/roster?aff=${aff}&gender=${gender}&species=${species}`}
            className="rounded-full border px-4 py-2"
          >
            View full roster
          </Link>
          <Link
            href={`/dc/ladder?aff=${aff}&gender=${gender}&species=${species}`}
            className="rounded-full border px-4 py-2"
          >
            View full ladder
          </Link>
        </div>
      </section>
    </main>
  );
}
