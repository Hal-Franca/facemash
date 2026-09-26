"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
const NAV = [
  { href: "/dc/arena", label: "Arena" },
  { href: "/dc/roster", label: "Roster" },
  { href: "/dc/ladder", label: "Ladder" },
];

/** Global top bar: universe logo, title, hamburger drawer (Arena/Roster/Ladder). */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { toggle } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="rounded-full border px-3 py-2 text-sm"
        >
          ☰
        </button>
        <Link href="/dc/arena" className="flex items-center gap-2" aria-label="Facemash home">
          <Image
            src="/images/logo-dc.png"
            alt="DC Universe logo"
            width={40}
            height={40}
            sizes="40px"
            className="h-10 w-10 rounded-lg object-contain"
            priority
          />
          <span className="text-xl font-black tracking-tight">Facemash — DC Supers</span>
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col gap-1 bg-white p-4 text-zinc-950 shadow-xl dark:bg-zinc-950 dark:text-zinc-50">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-black">Facemash</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-full border px-3 py-1 text-sm"
              >
                ✕
              </button>
            </div>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                  pathname === n.href ? "bg-zinc-100 dark:bg-zinc-900" : ""
                }`}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-zinc-200 pt-3 text-xs opacity-60 dark:border-zinc-800">
              <p className="px-3 font-semibold uppercase tracking-wide">Universe</p>
              <p className="mt-1 px-3">DC Universe</p>
            </div>
            <button
              onClick={toggle}
              aria-label="Toggle light and dark theme"
              className="mt-3 rounded-xl border px-3 py-2 text-left text-sm font-semibold"
            >
              🌓 Light / Dark
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
