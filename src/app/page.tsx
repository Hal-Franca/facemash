"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { catalog } from "@/data";
import type { Affiliation, Character, Gender, Rating, Species } from "@/data/types";
import { BASE_ELO, pickPair } from "@/lib/elo";
import { useRatings } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { AffiliationBadge, CharacterPortrait, StatCard } from "@/components/CharacterCard";

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

const SELECT_CLS =
  "rounded-lg border border-zinc-300 bg-white p-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:[color-scheme:dark]";

function VoteCard({
  c,
  rating,
  flipEnabled,
  showBelow,
  onVote,
}: {
  c: Character;
  rating: Rating | undefined;
  flipEnabled: boolean;
  showBelow: boolean;
  onVote: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const flipped = pinned || (flipEnabled && hover);
  const elo = rating?.elo ?? BASE_ELO;

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button onClick={onVote} className="block w-full text-left" aria-label={`Vote ${c.superName}`}>
        <div className="[perspective:1200px]">
          <div
            className="relative transition-transform duration-300 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <div className="[backface-visibility:hidden]">
              <CharacterPortrait c={c} priority />
            </div>
            {/* Back of card: stats on the card itself */}
            <div className="absolute inset-0 flex flex-col justify-center overflow-y-auto rounded-2xl border border-zinc-300 bg-zinc-100 p-4 text-left text-xs text-zinc-900 [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              <p className="font-bold">
                {c.superName} <span className="font-normal opacity-70">({c.name})</span>
              </p>
              <p className="mt-1">
                <AffiliationBadge value={c.affiliation} />
              </p>
              <hr className="my-2 border-zinc-300 dark:border-zinc-700" />
              <p className="opacity-80">{c.universeLabel}</p>
              <p className="mt-1 opacity-80">{c.teams.join("; ")}</p>
              <hr className="my-2 border-zinc-300 dark:border-zinc-700" />
              <p>
                <span className="font-semibold">Powers: </span>
                {c.powers.join(", ")}
              </p>
              <p className="mt-1 opacity-80">
                First: {c.firstAppearance.comic} {c.firstAppearance.issue} ({c.firstAppearance.year})
              </p>
              <p className="mt-1 font-semibold">Elo: {elo}</p>
              <hr className="my-2 border-zinc-300 dark:border-zinc-700" />
              <p className="opacity-70">{c.bio}</p>
            </div>
          </div>
        </div>
      </button>
      <p className="mt-2 text-center text-lg font-bold">
        {c.superName} <span className="font-normal opacity-60">({c.name})</span>
      </p>
      <p className="mt-1 flex items-center justify-center gap-2">
        <AffiliationBadge value={c.affiliation} />
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
    </div>
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
        <label className="flex flex-col gap-1 text-sm">
          Affiliation
          <select value={aff} onChange={(e) => setAff(e.target.value as AffFilter)} className={SELECT_CLS}>
            <option value="all">All</option>
            <option value="hero">Hero</option>
            <option value="anti-hero">Anti-hero</option>
            <option value="villain">Villain</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Gender
          <select value={gender} onChange={(e) => setGender(e.target.value as GenderFilter)} className={SELECT_CLS}>
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Species
          <select value={species} onChange={(e) => setSpecies(e.target.value as SpeciesFilter)} className={SELECT_CLS}>
            <option value="all">All</option>
            <option value="human">Human</option>
            <option value="meta-human">Meta-human</option>
            <option value="alien">Alien</option>
            <option value="other">Other</option>
          </select>
        </label>
      </section>

      {/* Arena */}
      {left && right ? (
        <section className="mt-6">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
            <div>
              <VoteCard c={left} rating={rOf(left.id)} flipEnabled={flipEnabled} showBelow={showBelow} onVote={() => choose(left.id, right.id)} />
              <p className="mt-3 text-center text-sm">
                <button onClick={() => skipOne(left.id)} className="rounded-full border px-4 py-2">Skip right (keep left)</button>
              </p>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 pt-0 sm:flex-col sm:gap-3 sm:pt-40">
              <div className="font-black opacity-50">OR</div>
              <button onClick={skipBoth} className="rounded-full border px-4 py-2 text-sm">Skip both ⟳</button>
            </div>
            <div>
              <VoteCard c={right} rating={rOf(right.id)} flipEnabled={flipEnabled} showBelow={showBelow} onVote={() => choose(right.id, left.id)} />
              <p className="mt-3 text-center text-sm">
                <button onClick={() => skipOne(right.id)} className="rounded-full border px-4 py-2">Skip left (keep right)</button>
              </p>
            </div>
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
        <ol className="mt-3 grid gap-2 md:grid-cols-2">
          {ranked.map((c, i) => {
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
      </section>
    </main>
  );
}
