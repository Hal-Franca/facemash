"use client";
import { useSyncExternalStore } from "react";

/** Floating back-to-top, appears after scrolling. No setState-in-effect. */
export function BackToTop() {
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
