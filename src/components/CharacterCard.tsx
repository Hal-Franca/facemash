import type { Character } from "@/data/types";

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
    return (
      // Plain <img> on purpose: art dimensions vary by source; CSS enforces uniform 3:4 crop.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={c.image.url}
        alt={c.image.alt}
        loading={priority ? "eager" : "lazy"}
        className="aspect-[3/4] w-full rounded-2xl object-cover"
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

export function StatCard({ c, elo }: { c: Character; elo?: number }) {
  return (
    <div className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white/80 p-4 text-left text-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <p className="font-bold">
        {c.superName} <span className="font-normal opacity-70">({c.name})</span>
      </p>
      <dl className="mt-2 space-y-1 opacity-90">
        <div className="flex gap-2"><dt className="font-semibold">Affiliation:</dt><dd className="capitalize">{c.affiliation}</dd></div>
        <div className="flex gap-2"><dt className="font-semibold">Gender:</dt><dd className="capitalize">{c.gender}</dd></div>
        <div className="flex gap-2"><dt className="font-semibold">Species:</dt><dd className="capitalize">{c.species}</dd></div>
        <div className="flex gap-2"><dt className="font-semibold">First appearance:</dt><dd>{c.firstAppearance.comic} {c.firstAppearance.issue} ({c.firstAppearance.year})</dd></div>
        <div><dt className="font-semibold">Powers:</dt><dd>{c.powers.join(", ")}</dd></div>
        {typeof elo === "number" && (
          <div className="flex gap-2"><dt className="font-semibold">Elo:</dt><dd>{elo}</dd></div>
        )}
      </dl>
      <p className="mt-2 opacity-70">{c.bio}</p>
    </div>
  );
}
