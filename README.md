# Facemash — DC Supers

Vote and rank DC heroes, villains and anti-heroes, Facemash-style. English-only MVP.
Portuguese i18n is backlog. Stack: **TypeScript + Next.js (App Router) + Tailwind v4**.

## Why this exists

This started as an unfinished school project (SENAC): a Facemash-style app where
you vote between two faces — but for DC heroes, villains and anti-heroes instead
of people. I'm rebuilding it from zero for two reasons: to properly learn
AI-assisted development (building with coding agents), and to turn it into a
portfolio piece.

**What it answers:** *is Batman truly the best?* Opinions are cheap — randomized
1v1 voting with chess-style Elo produces a crowd verdict instead. Filters go
further: best of the Bat-Family? Of the Lanterns? Of villains?

**Why DC first:** 250 DC characters are the template. Once the design, ranking
engine and data model are proven here, Marvel and anime plug into the same system.

Votes apply instantly locally, then sync to the server board when a database is
configured — the header shows "shared global board" vs "stored locally".
Without `POSTGRES_URL`, everything stays in `localStorage` (nothing breaks).
Deploys on **Vercel** (App Router + SSG, security headers in `next.config.ts`).

## Global board setup (Vercel Postgres, free tier)

1. Vercel dashboard → Storage → Create Database → Postgres → connect this project.
   This injects `POSTGRES_URL` (preview + production envs).
2. Open the database Query tab and run `scripts/schema.sql` once.
3. Redeploy. Votes now POST to `/api/vote` (server-side Elo, validated
   character ids) and boards load from `/api/ratings`.

Local dev against a DB: `npm i -g vercel; vercel env pull` (or set `POSTGRES_URL`
manually), then `npm run dev`.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest (Elo unit tests)
npm run validate:roster  # 30-character data check
npm run lint
npm run build
```

## What it does (MVP)

- 1v1 arena, click to vote, Elo rating (K=32, base 1400) — `src/lib/elo.ts:1`
- Rankings with W/L + Elo, filterable by affiliation / gender / species
- Skip: both sides ⟳, keep-left, keep-right
- Hover/toggle stat card: super name, civil name, first appearance
  (comic + issue + year), powers, affiliation, gender, species, bio
- Character page: `/characters/[id]`
- Dark default + light toggle, responsive mobile-first, 3:4 portraits

## Data layout (extensible — don't redo later)

```text
src/data/
  types.ts                 # Character, Affiliation, Gender, Species
  index.ts                 # catalog[] aggregator
  comics/dc/heroes.ts      # 30 heroes (your roster)
  comics/dc/villains.ts    # 30 villains (your roster)
  comics/dc/anti-heroes.ts # 28 anti-heroes (your 30 minus Ra's+Talia, kept once as villains)
  comics/marvel/           # future — same shape
  anime/                   # future — same shape
public/images/comics/dc/<id>.webp  # future licensed art (placeholders for now)
```

Add a universe by adding one folder + one import in `src/data/index.ts`.
Fields are validated by `scripts/validate-roster.ts`.

## Images & licensing

No copyrighted art is bundled. `image.url` is `null` for all 88 MVP characters;
UI renders a consistent-size initial placeholder (`CharacterPortrait`).
This keeps the repo legal and images uniform (600×800, 3:4 `object-cover`).

Raw art lives outside the repo; standardized copies are imported with:

```bash
node scripts/import-images.mjs "C:/path/to/raw/img"  # -> public/images/comics/dc/*.webp (fit inside 600x800, no crop; framing is CSS-only)
```

253 portraits are already imported there. All 226 catalog characters have art
wired via `src/data/comics/dc/art.ts` (id → file). Fan-curated data: first
appearances/powers verified for major characters, best-effort for obscure ones.

To add real art later (per character):

1. Only use art you own/license, or DC-official press-kit / Wikimedia with
   attribution. Store credit in `image.credit`.
2. Resize to **600×800 webp, <200KB**, save as `public/images/comics/dc/<id>.webp`.
3. Set `image.url` to `/images/comics/dc/<id>.webp`.
4. Good comics-knowledge sources for *info/bio research* (not hotlinking):
   DC Comics official encyclopedia, DC Database Wiki, Comic Vine, League of
   Comic Geeks — link/credit them, don't scrape-hotlink their binaries.

## Hosting: Vercel vs Cloudflare Pages vs GitHub Pages

| | Vercel | Cloudflare Pages | GitHub Pages |
|---|---|---|---|
| Next.js App Router | Native, zero config — **pick this** | Needs `@cloudflare/next-on-pages` adapter | Static export only (`output: export`), no server fns |
| API routes / future global votes | Yes (serverless) | Yes via Functions + D1/KV | No — needs separate backend |
| Free always-on | Yes, no sleep. 100GB bandwidth/mo | Yes, no sleep. Unlimited bandwidth* | Yes, no sleep. Static only |
| Best for | MVP → global votes fastest | Scale + free DB (D1) later | Local-only demo cheapest |

Recommendation: **deploy this repo to Vercel now** (it already builds static +
SSG). If you outgrow Vercel DB costs, migrate data layer to Cloudflare D1 —
`src/data/*` shape already isolates that move.

## Security / quality (industry baseline)

- No secrets in repo; no auth yet so no session handling to get wrong
- `localStorage` only, JSON.parse in try/catch, no `dangerouslySetInnerHTML`
- Rate-limit + bot-abuse controls deferred to global-backend sprint (see KANBAN)
- Tests: `src/lib/__tests__/elo.test.ts`; lint clean; `validate:roster` in CI
- Branches: `feature/*` → `dev` → `staging` → `prod` (Vercel Production = `prod`).
  Each env gets its own Postgres so staging/dev votes never touch prod MMR/ratings/W-L.
  See `.env.example`. PRs with checks

## Roadmap

See `KANBAN.md`. Next: global votes backend (Vercel KV/Upstash or D1),
admin CRUD, PT-BR i18n, Marvel + Anime universes.
