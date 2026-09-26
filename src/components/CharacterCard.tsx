import Link from "next/link";
import type { Affiliation, Character } from "@/data/types";
import type { Tier } from "@/lib/ranking";

const AFFILIATION_STYLES: Record<Affiliation, string> = {
  hero: "bg-sky-500/15 text-sky-700 ring-sky-500/40 dark:text-sky-300",
  villain: "bg-red-500/15 text-red-700 ring-red-500/40 dark:text-red-300",
  "anti-hero": "bg-amber-500/15 text-amber-700 ring-amber-500/40 dark:text-amber-300",
  other: "bg-zinc-500/15 text-zinc-700 ring-zinc-500/40 dark:text-zinc-300",
};

/** Color-coded moral-role badge: hero (blue) / villain (red) / anti-hero (amber). */
export function AffiliationBadge({ value }: { value: Affiliation }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ring-1 ring-inset ${AFFILIATION_STYLES[value]}`}
    >
      {value}
    </span>
  );
}

const TIER_STYLES: Record<Tier, string> = {
  Bronze: "bg-amber-800/15 text-amber-800 ring-amber-800/40 dark:text-amber-500",
  Silver: "bg-zinc-400/15 text-zinc-600 ring-zinc-400/40 dark:text-zinc-300",
  Gold: "bg-yellow-500/15 text-yellow-700 ring-yellow-500/40 dark:text-yellow-300",
  Platinum: "bg-cyan-500/15 text-cyan-700 ring-cyan-500/40 dark:text-cyan-300",
  Diamond: "bg-violet-500/15 text-violet-700 ring-violet-500/40 dark:text-violet-300",
  Grandmaster: "bg-fuchsia-500/15 text-fuchsia-700 ring-fuchsia-500/40 dark:text-fuchsia-300",
};

/** SC2-style ladder tier badge. Kept for roster/profile use (rankings rows stay clean). */
export function TierBadge({ value }: { value: Tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${TIER_STYLES[value]}`}
    >
      {value}
    </span>
  );
}

/** Uniform single-line leaderboard row: #rank + Super (Real) + badge + race + score. */
export function RankRow({
  rank,
  c,
  elo,
  wins,
  losses,
}: {
  rank: string;
  c: Character;
  elo: number;
  wins: number;
  losses: number;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm">
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="w-10 shrink-0 font-black opacity-60">#{rank}</span>
        <Link href={`/characters/${c.id}`} className="truncate font-semibold hover:underline">
          {c.superName} <span className="font-normal opacity-60">({c.name})</span>
        </Link>
        <AffiliationBadge value={c.affiliation} />
        <span className="hidden shrink-0 capitalize opacity-60 sm:inline">{c.species}</span>
      </span>
      <span className="shrink-0 whitespace-nowrap opacity-80">
        {elo} · {wins}W/{losses}L
      </span>
    </li>
  );
}

function initials(c: Character) {
  return c.superName
    .split(/[\s-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Fixed 3:4 aspect, responsive, consistent size. Uses remote art when licensed, else styled placeholder. */
export function CharacterPortrait({ c, priority = false }: { c: Character; priority?: boolean }) {
  if (c.image.url) {
    if (c.image.fit === "contain") {
      // Wide art: blurred-fill backdrop + full image on top (no dead bands, no crop).
      return (
        <div
          role="img"
          aria-label={c.image.alt}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-900"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(c.image.url)}
            alt=""
            aria-hidden="true"
            loading={priority ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl brightness-[0.6]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(c.image.url)}
            alt={c.image.alt}
            loading={priority ? "eager" : "lazy"}
            className="relative h-full w-full object-contain"
          />
        </div>
      );
    }
    // Plain <img> on purpose: art dimensions vary by source; CSS enforces uniform 3:4 crop.
    // encodeURI: files keep their original "Super - Name" spelling (spaces, quotes).
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={encodeURI(c.image.url)}
        alt={c.image.alt}
        loading={priority ? "eager" : "lazy"}
        style={c.image.focus ? { objectPosition: c.image.focus } : undefined}
        className="aspect-[3/4] w-full rounded-2xl object-cover object-top"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={c.image.alt}
      className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-700 via-zinc-900 to-black dark:from-zinc-700 dark:via-zinc-900 dark:to-black from-slate-200 via-slate-300 to-slate-400"
    >
      <span className="text-6xl font-black tracking-tight text-white drop-shadow dark:text-white text-slate-700">
        {initials(c)}
      </span>
    </div>
  );
}

export function StatCard({ c, elo, className = "" }: { c: Character; elo?: number; className?: string }) {
  return (
    <div className={`mt-3 w-full flex-1 rounded-2xl border border-zinc-200 bg-white/80 p-4 text-left text-sm dark:border-zinc-800 dark:bg-zinc-950/80 ${className}`}>
      <StatHeading c={c} />
      <StatDetails c={c} elo={elo} />
    </div>
  );
}

/** Name heading shared by the below-card stats and the flip-card back. */
export function StatHeading({ c }: { c: Character }) {
  return (
    <p className="text-base font-bold sm:text-lg">
      {c.superName} <span className="font-normal opacity-70">({c.name})</span>
    </p>
  );
}

/** Full labeled stat block (universe → bio) shared by both stats views. */
export function StatDetails({ c, elo }: { c: Character; elo?: number }) {
  return (
    <>
      <dl className="mt-2 space-y-1 opacity-90">
        <div className="flex gap-2"><dt className="font-semibold">Universe:</dt><dd>{c.universeLabel}</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex gap-2"><dt className="font-semibold">Affiliation:</dt><dd><AffiliationBadge value={c.affiliation} /></dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex gap-2"><dt className="font-semibold">Teams:</dt><dd>{c.teams.join("; ")}</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex gap-2"><dt className="font-semibold">Gender:</dt><dd className="capitalize">{c.gender}</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex gap-2"><dt className="font-semibold">Species:</dt><dd className="capitalize">{c.species}</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex gap-2"><dt className="font-semibold">First appearance:</dt><dd>{c.firstAppearance.comic} {c.firstAppearance.issue} ({c.firstAppearance.year})</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex gap-2"><dt className="font-semibold">Powers:</dt><dd>{c.powers.join(", ")}</dd></div>
        {typeof elo === "number" && (
          <>
            <hr className="border-zinc-300 dark:border-zinc-700" />
            <div className="flex gap-2"><dt className="font-semibold">Elo:</dt><dd>{elo}</dd></div>
          </>
        )}
      </dl>
      <hr className="my-1 border-zinc-300 dark:border-zinc-700" />
      <p className="opacity-70"><span className="font-semibold opacity-100">Bio:</span> {c.bio}</p>
    </>
  );
}
