import Link from "next/link";
import { catalog, getCharacter } from "@/data";
import { CharacterPortrait, StatCard } from "@/components/CharacterCard";

export function generateStaticParams() {
  return catalog.map((c) => ({ id: c.id }));
}

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCharacter(id);
  if (!c) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p>Character not found.</p>
        <Link href="/" className="underline">Back</Link>
      </main>
    );
  }
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6">
      <Link href="/" className="text-sm underline opacity-70">← Back to arena</Link>
      <h1 className="mt-2 text-3xl font-black">{c.superName}</h1>
      <p className="opacity-70">{c.name} · {c.universe.toUpperCase()} · {c.category}</p>
      {/* Stacked on mobile (unchanged); side-by-side on desktop */}
      <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:items-start">
        <div className="mx-auto w-full max-w-sm">
          <CharacterPortrait c={c} priority />
        </div>
        <StatCard c={c} className="sm:mt-0" />
      </div>
    </main>
  );
}
