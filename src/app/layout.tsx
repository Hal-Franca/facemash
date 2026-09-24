import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Facemash — DC Supers",
  description: "Vote and rank DC heroes, villains and anti-heroes. Facemash-style Elo ladder.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className="min-h-full bg-white text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider>
          {children}
          <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-center text-xs opacity-70">
            <p>
              © {year}{" "}
              <a
                href="https://github.com/hal-franca"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Hal Franca
              </a>{" "}
              · Fan-made demo for educational purposes. Not affiliated with DC Comics.
            </p>
            <p className="mt-1">
              Character artwork © DC Comics. Images sourced via{" "}
              <a
                href="https://comicvine.gamespot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Comic Vine
              </a>{" "}
              for identification only — will be removed on request.
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
