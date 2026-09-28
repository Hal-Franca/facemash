"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { catalog } from "@/data";
import type { Affiliation, Character, Gender, Rating, Species } from "@/data/types";
import { BASE_ELO, pickPair } from "@/lib/elo";
import { useRatings } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { AffiliationBadge, CharacterPortrait, RankRow, StatCard, StatDetails, StatHeading, hasRealName } from "@/components/CharacterCard";
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

/** Versus badge styled after the site favicon: gold ring, navy face, gold VS. */
function VsBadge() {
  return (
    <div
      aria-hidden="true"
      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-400 bg-[#0d0d2b] shadow-[0_0_12px_rgba(251,191,36,0.45)] sm:h-14 sm:w-14"
    >
      <span className="-skew-x-6 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-base font-black italic tracking-tight text-transparent sm:text-xl">
        VS
      </span>
    </div>
  );
}

function SideCard({
  c,
  rating,
  flipEnabled,
  showBelow,
  onVote,
  flash,
  accent,
  headerCls,
  portraitCls,
  belowCls,
}: {
  c: Character;
  rating: Rating | undefined;
  flipEnabled: boolean;
  showBelow: boolean;
  onVote: () => void;
  flash: boolean;
  /** Corner color: left card blue, right card red — the favicon faceoff. */
  accent: "blue" | "red";
  headerCls: string;
  portraitCls: string;
  belowCls: string;
}) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  // Flip overlay only exists on sm+ screens — on mobile the portrait is too
  // narrow for overlay text, so pin expands the stats below the image instead.
  const flipped = pinned || (flipEnabled && hover);
  const elo = rating?.elo ?? BASE_ELO;

  return (
    <>
      <div className={headerCls}>
        <p className={`text-center text-sm font-bold break-words sm:text-lg ${accent === "blue" ? "text-sky-600 dark:text-sky-400" : "text-red-600 dark:text-red-400"}`}>{c.superName}</p>
        {hasRealName(c) && (
          <p className="text-center text-xs font-normal break-words opacity-60 sm:text-sm">{c.name}</p>
        )}
      </div>
      <div className={portraitCls} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <button onClick={onVote} className="block w-full text-left" aria-label={`Vote ${c.superName}`}>
        <div className={`[perspective:1200px] rounded-2xl transition-all ${flash ? "ring-8 ring-green-500 motion-safe:scale-[1.02]" : ""}`}>
          <div
            className={`relative transition-transform duration-[400ms] [transform-style:preserve-3d] ${flipped ? "sm:[transform:rotateY(180deg)]" : "sm:[transform:rotateY(0deg)]"}`}
          >
            <div className="[backface-visibility:hidden]">
              <CharacterPortrait c={c} priority />
            </div>
            {/* Back of card: desktop-only overlay (hidden on mobile — stats go below instead) */}
            <div className="absolute inset-0 hidden overflow-y-auto rounded-2xl border border-zinc-300 bg-zinc-100 p-4 text-left text-sm text-zinc-900 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:block dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              <StatHeading c={c} />
              <hr className="my-2 border-zinc-300 dark:border-zinc-700" />
              <StatDetails c={c} elo={elo} />
            </div>
          </div>
        </div>
        </button>
      </div>
      <div className={belowCls}>
        <div className="mt-2 flex flex-col items-center gap-1 text-xs sm:mt-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2 sm:text-sm">
          <AffiliationBadge value={c.affiliation} />
          <span className="capitalize opacity-60">{c.species}</span>
          <span
            role="button"
            tabIndex={0}
            title={pinned ? "Unpin stats" : "Show stats below"}
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
        </div>
        {showBelow && <StatCard c={c} elo={elo} />}
        {pinned && !showBelow && (
          <div className="sm:hidden">
            <StatCard c={c} elo={elo} />
          </div>
        )}
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

  const { ratings, vote } = useRatings(poolIds);
  const [pair, setPair] = useState<[string, string] | null>(null);
  // Winner-flash feedback: portrait glows green briefly before the next pair.
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);
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
    if (justVoted) return; // ignore taps during the flash
    vote(winnerId, loserId);
    setJustVoted(winnerId);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => {
      setPair(pickPair(poolIds));
      setJustVoted(null);
      flashTimer.current = null;
    }, 320);
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
          Who is your favorite? Click to vote. Elo-ranked, shared global board.
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
        <div className="flex items-center justify-between sm:col-span-3">
          <p className="text-sm font-semibold opacity-70">Filters</p>
          {(aff !== "all" || gender !== "all" || species !== "all") && (
            <button
              onClick={() => {
                setAff("all");
                setGender("all");
                setSpecies("all");
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
      </section>

      {/* Arena */}
      {left && right ? (
        <section className="mt-6">
          {/* Side-by-side on all breakpoints: names R1, portraits+OR R2, meta R3, skip-both R4 (mobile full-width). */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 gap-y-3 sm:gap-x-6 sm:gap-y-4">
            <SideCard
              c={left} rating={rOf(left.id)} flipEnabled={flipEnabled} showBelow={showBelow}
              onVote={() => choose(left.id, right.id)} flash={justVoted === left.id} accent="blue"
              headerCls="col-start-1 row-start-1"
              portraitCls="col-start-1 row-start-2"
              belowCls="col-start-1 row-start-4 flex flex-col"
            />
            <div className="col-start-2 row-start-2 flex flex-col items-center justify-center gap-2 self-center sm:min-w-28 sm:gap-3">
              <VsBadge />
            </div>
            <SideCard
              c={right} rating={rOf(right.id)} flipEnabled={flipEnabled} showBelow={showBelow}
              onVote={() => choose(right.id, left.id)} flash={justVoted === right.id} accent="red"
              headerCls="col-start-3 row-start-1"
              portraitCls="col-start-3 row-start-2"
              belowCls="col-start-3 row-start-4 flex flex-col"
            />
            <div className="col-start-1 row-start-3 flex w-full items-center gap-2">
              <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />
              <button onClick={() => skipOne(left.id)} className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] sm:px-5 sm:py-2 sm:text-sm" aria-label="Keep left card, skip right card">Keep left</button>
              <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />
            </div>
            <div className="col-start-2 row-start-3 flex w-full items-center justify-center">
              <button onClick={skipBoth} className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] sm:px-5 sm:py-2 sm:text-sm">Skip ⟳</button>
            </div>
            <div className="col-start-3 row-start-3 flex w-full items-center gap-2">
              <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />
              <button onClick={() => skipOne(right.id)} className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] sm:px-5 sm:py-2 sm:text-sm" aria-label="Keep right card, skip left card">Keep right</button>
              <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />
            </div>
          </div>
        </section>
      ) : mounted ? (
        <p className="mt-6 rounded-2xl border p-6 text-center">Not enough characters for this filter — loosen it.</p>
      ) : (
        <section className="mt-6 grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-6" aria-busy="true" aria-label="Loading matchup">
          <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="self-center"><VsBadge /></div>
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
