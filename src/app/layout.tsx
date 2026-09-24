import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Facemash — DC Supers",
  description: "Vote and rank DC heroes, villains and anti-heroes. Facemash-style Elo ladder.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className="min-h-full bg-white text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
