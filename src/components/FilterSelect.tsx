"use client";
import type { ReactNode } from "react";

export const SELECT_CLS =
  "w-full appearance-none rounded-lg border border-zinc-300 bg-white p-2 pr-10 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:[color-scheme:dark]";

/** Native select + custom chevron (browser arrows ignore padding, so we draw our own). */
export function FilterSelect({
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
