import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Facemash - DC - How to Play",
  description: "How voting, skipping, Elo rankings, filters, and stats work in Facemash DC Supers.",
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Vote",
    body: "Two characters appear at a time. Click your favorite — they gain Elo, the other loses it. Bigger upsets move more points (up to ~27 at K=32); beating weaker picks pays ~5.",
  },
  {
    title: "Skip",
    body: "Don't know one side? Skip right (keep left), skip left (keep right), or skip both for a fresh pair. Skips never touch ratings.",
  },
  {
    title: "Rankings & tiers",
    body: "Order is Elo, then wins, then battles, then A–Z, with shared ranks shown as #2A, #2B. Tiers run Bronze to Diamond by Elo band; Grandmaster is the top-20 rows with at least 5 battles. Home shows the top 20 — the full boards live on Roster and Ladder.",
  },
  {
    title: "Filters & search",
    body: "Narrow the pool by affiliation, gender, or species — rankings, arena, roster, and ladder all follow. Roster and Ladder also have name search (super name or real name) and A–Z / Z–A sorting. The arena stays random on purpose.",
  },
  {
    title: "Stats & flip cards",
    body: "Hover a portrait (desktop) to flip it and reveal stats, or pin it with ⓘ stats. The Stats-below toggle shows full stat blocks under each card instead. Every card links to a full profile page.",
  },
  {
    title: "Your data",
    body: "Votes store in your browser by default (subtitle reads “stored locally”). Once the shared board is live it reads “shared global board” and your votes sync across devices.",
  },
];

export default function HowToPlayPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-6">
      <SiteHeader />
      <h1 className="mt-3 text-2xl font-black tracking-tight">How to Play</h1>
      <p className="mt-1 opacity-70">
        Everything below also lives behind the buttons — this page just explains them.
      </p>
      <ol className="mt-6 space-y-4">
        {SECTIONS.map((s, i) => (
          <li key={s.title} className="rounded-2xl border p-4">
            <p className="font-bold">
              {i + 1}. {s.title}
            </p>
            <p className="mt-1 text-sm opacity-80">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
        <Link href="/dc/arena" className="rounded-full border px-4 py-2">
          Start voting
        </Link>
        <Link href="/dc/roster" className="rounded-full border px-4 py-2">
          Browse roster
        </Link>
      </div>
    </main>
  );
}
