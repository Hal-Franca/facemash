import Link from "next/link";
import type { Affiliation, Character } from "@/data/types";
import type { Tier } from "@/lib/ranking";

const AFFILIATION_STYLES: Record<Affiliation, string> = {
  hero: "bg-sky-500/15 text-sky-700 ring-sky-500/40 dark:text-sky-300",
  villain: "bg-red-500/15 text-red-700 ring-red-500/40 dark:text-red-300",
  "anti-hero": "bg-amber-500/15 text-amber-700 ring-amber-500/40 dark:text-amber-300",
  other: "bg-zinc-500/15 text-zinc-700 ring-zinc-500/40 dark:text-zinc-300",
};

/** True when the character has a civilian identity worth showing in parentheses.
 * Empty (e.g. Bane) or identical to the super name (e.g. Ra's al Ghul) → show super name alone. */
export function hasRealName(c: { superName: string; name: string }) {
  return !!c.name && c.name !== c.superName;
}

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

/** Uniform leaderboard row. Single line on desktop; name+affiliation / elo-record on mobile. */
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
    <li className="flex min-w-0 flex-col gap-1 rounded-xl border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="w-10 shrink-0 font-black opacity-60">#{rank}</span>
        <Link href={`/dc/characters/${c.id}`} className="truncate font-semibold hover:underline">
          {c.superName}{hasRealName(c) && <span className="font-normal opacity-60"> ({c.name})</span>}
        </Link>
        <span className="hidden sm:inline-flex">
          <AffiliationBadge value={c.affiliation} />
        </span>
        <span className="hidden shrink-0 capitalize opacity-60 sm:inline">{c.species}</span>
      </span>
      <span className="flex items-center gap-2 pl-12 text-xs opacity-80 sm:hidden">
        <AffiliationBadge value={c.affiliation} />
        <span className="whitespace-nowrap">
          {elo} · {wins}W/{losses}L
        </span>
      </span>
      <span className="hidden shrink-0 whitespace-nowrap opacity-80 sm:inline">
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
    <div className={`mt-2 w-full flex-1 rounded-2xl border border-zinc-200 bg-white/80 p-3 text-left text-xs sm:mt-3 sm:p-4 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950/80 ${className}`}>
      <StatHeading c={c} />
      <StatDetails c={c} elo={elo} />
    </div>
  );
}

/** Name heading shared by the below-card stats and the flip-card back. */
export function StatHeading({ c }: { c: Character }) {
  return (
    <p className="text-base font-bold sm:text-lg">
      {c.superName}{hasRealName(c) && <span className="font-normal opacity-70"> ({c.name})</span>}
    </p>
  );
}

/** Full labeled stat block (universe → bio) shared by both stats views. */
export function StatDetails({ c, elo }: { c: Character; elo?: number }) {
  return (
    <>
      {/* Stacked label-over-value on mobile (narrow columns), side-by-side on sm+. */}
      <dl className="mt-2 space-y-1.5 opacity-90 sm:space-y-1">
        <div className="flex flex-col gap-0 sm:flex-row sm:gap-2"><dt className="text-xs font-semibold uppercase tracking-wide opacity-60 sm:text-sm sm:normal-case sm:tracking-normal sm:opacity-100">Universe:</dt><dd className="min-w-0 break-words">{c.universeLabel}</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-2"><dt className="text-xs font-semibold uppercase tracking-wide opacity-60 sm:text-sm sm:normal-case sm:tracking-normal sm:opacity-100">Affiliation:</dt><dd className="min-w-0 break-words"><AffiliationBadge value={c.affiliation} /></dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex flex-col gap-0 sm:flex-row sm:gap-2"><dt className="text-xs font-semibold uppercase tracking-wide opacity-60 sm:text-sm sm:normal-case sm:tracking-normal sm:opacity-100">Teams:</dt><dd className="min-w-0 break-words">{c.teams.join("; ")}</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex flex-col gap-0 sm:flex-row sm:gap-2"><dt className="text-xs font-semibold uppercase tracking-wide opacity-60 sm:text-sm sm:normal-case sm:tracking-normal sm:opacity-100">Gender:</dt><dd className="min-w-0 capitalize break-words">{c.gender}</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex flex-col gap-0 sm:flex-row sm:gap-2"><dt className="text-xs font-semibold uppercase tracking-wide opacity-60 sm:text-sm sm:normal-case sm:tracking-normal sm:opacity-100">Species:</dt><dd className="min-w-0 capitalize break-words">{c.species}</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex flex-col gap-0 sm:flex-row sm:gap-2"><dt className="text-xs font-semibold uppercase tracking-wide opacity-60 sm:text-sm sm:normal-case sm:tracking-normal sm:opacity-100">First appearance:</dt><dd className="min-w-0 break-words">{c.firstAppearance.comic} {c.firstAppearance.issue} ({c.firstAppearance.year})</dd></div>
        <hr className="border-zinc-300 dark:border-zinc-700" />
        <div className="flex flex-col gap-0 sm:flex-row sm:gap-2"><dt className="text-xs font-semibold uppercase tracking-wide opacity-60 sm:text-sm sm:normal-case sm:tracking-normal sm:opacity-100">Powers:</dt><dd className="min-w-0 break-words">{c.powers.join(", ")}</dd></div>
        {typeof elo === "number" && (
          <>
            <hr className="border-zinc-300 dark:border-zinc-700" />
            <div className="flex flex-col gap-0 sm:flex-row sm:gap-2"><dt className="text-xs font-semibold uppercase tracking-wide opacity-60 sm:text-sm sm:normal-case sm:tracking-normal sm:opacity-100">Elo:</dt><dd className="min-w-0 break-words">{elo}</dd></div>
          </>
        )}
      </dl>
      <hr className="my-1 border-zinc-300 dark:border-zinc-700" />
      <p className="opacity-70"><span className="font-semibold opacity-100">Bio:</span> {c.bio}</p>
    </>
  );
}
