"use client";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { catalog } from "@/data";
import type { Affiliation, Character, Gender, Rating, Species } from "@/data/types";
import { BASE_ELO, pickPair } from "@/lib/elo";
import { useRatings } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { AffiliationBadge, CharacterPortrait, StatCard, StatDetails, StatHeading } from "@/components/CharacterCard";

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

/** Floating back-to-top, appears after scrolling past the arena. No setState-in-effect. */
function BackToTop() {
  const show = useSyncExternalStore(
    (cb) => {
      window.addEventListener("scroll", cb, { passive: true });
      return () => window.removeEventListener("scroll", cb);
    },
    () => window.scrollY > 600,
    () => false
  );
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 rounded-full border border-zinc-300 bg-white/90 px-4 py-2 text-sm shadow-lg backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:hover:bg-zinc-900"
    >
      ↑ Top
    </button>
  );
}
const SELECT_CLS =
  "w-full appearance-none rounded-lg border border-zinc-300 bg-white p-2 pr-10 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:[color-scheme:dark]";

/** Native select + custom chevron (browser arrows ignore padding, so we draw our own). */
function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT_CLS}>
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
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
            className="relative transition-transform duration-150 [transform-style:preserve-3d]"
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
  const [flipEnabled, setFlipEnabled] = useState(true);
  const [showBelow, setShowBelow] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

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
  const ranked = useMemo(
    () =>
      [...pool].sort(
        (a, b) => (rOf(b.id)?.elo ?? BASE_ELO) - (rOf(a.id)?.elo ?? BASE_ELO)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, ratings, mounted]
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Facemash — DC Supers</h1>
          <p className="opacity-70">Who wins? Click to vote. Elo-ranked, stored locally.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFlipEnabled((s) => !s)} className="rounded-full border px-4 py-2 text-sm" aria-pressed={flipEnabled}>
            {flipEnabled ? "🂠 Flip: on" : "🂠 Flip: off"}
          </button>
          <button onClick={() => setShowBelow((s) => !s)} className="rounded-full border px-4 py-2 text-sm" aria-pressed={showBelow}>
            {showBelow ? "Stats below: on" : "Stats below: off"}
          </button>
          <button onClick={toggle} className="rounded-full border px-4 py-2 text-sm" aria-label="Toggle theme">
            {!mounted || theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* Filters */}
      <section className="mt-6 grid gap-3 rounded-2xl border p-4 sm:grid-cols-3">
        <FilterSelect label="Affiliation" value={aff} onChange={(v) => { setAff(v as AffFilter); setVisibleCount(20); }}>
          <option value="all">All</option>
          <option value="hero">Hero</option>
          <option value="anti-hero">Anti-hero</option>
          <option value="villain">Villain</option>
        </FilterSelect>
        <FilterSelect label="Gender" value={gender} onChange={(v) => { setGender(v as GenderFilter); setVisibleCount(20); }}>
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </FilterSelect>
        <FilterSelect label="Species" value={species} onChange={(v) => { setSpecies(v as SpeciesFilter); setVisibleCount(20); }}>
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
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <span className="h-px flex-1 bg-zinc-300 sm:hidden dark:bg-zinc-700" aria-hidden="true" />
                <div className="font-black opacity-50">OR</div>
                <span className="h-px flex-1 bg-zinc-300 sm:hidden dark:bg-zinc-700" aria-hidden="true" />
              </div>
              <button onClick={skipBoth} className="rounded-full border px-4 py-2 text-sm">Skip both ⟳</button>
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

      {/* Rankings */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Rankings ({ranked.length})</h2>
        <p className="mt-1 text-sm opacity-60">Showing {Math.min(visibleCount, ranked.length)} of {ranked.length}</p>
        <ol className="mt-3 grid gap-2 md:grid-cols-2">
          {ranked.slice(0, visibleCount).map((c, i) => {
            const r = rOf(c.id);
            return (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-7 font-black opacity-60">#{i + 1}</span>
                  <Link href={`/characters/${c.id}`} className="font-semibold hover:underline">
                    {c.superName}
                  </Link>
                  <AffiliationBadge value={c.affiliation} />
                  <span className="opacity-60 capitalize">{c.species}</span>
                </span>
                <span className="opacity-80">{r?.elo ?? BASE_ELO} · {r?.wins ?? 0}W/{r?.losses ?? 0}L</span>
              </li>
            );
          })}
        </ol>
        {ranked.length > 20 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            {visibleCount < ranked.length && (
              <button onClick={() => setVisibleCount((v) => Math.min(v + 20, ranked.length))} className="rounded-full border px-4 py-2">
                Show more ({ranked.length - visibleCount} left)
              </button>
            )}
            {visibleCount > 20 && visibleCount < ranked.length && (
              <button onClick={() => setVisibleCount((v) => Math.max(20, v - 20))} className="rounded-full border px-4 py-2">
                Show less
              </button>
            )}
            {visibleCount < ranked.length ? (
              <button onClick={() => setVisibleCount(ranked.length)} className="rounded-full border px-4 py-2">
                Show all ({ranked.length})
              </button>
            ) : (
              <button onClick={() => setVisibleCount(20)} className="rounded-full border px-4 py-2">
                Show less (back to 20)
              </button>
            )}
          </div>
        )}
      </section>
      <BackToTop />
    </main>
  );
}
