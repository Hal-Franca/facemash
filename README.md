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

## Global board setup (Neon Postgres via Vercel, free tier)

1. Vercel dashboard → Storage → Browse → **Neon / Serverless Postgres** → Create
   (`facemash-db`, region matching deployment — `iad1`/DC East, Auth OFF, free plan).
2. On the Install Integration screen: set **Custom Prefix to `POSTGRES`**
   (default `STORAGE` injects `STORAGE_URL`, which this app ignores — it reads
   `POSTGRES_URL`). Environments: Production + Preview checked, Development
   unchecked (local dev stays on `localStorage`). Leave database-branch boxes
   unchecked (one shared DB). Keep Sensitive on → Connect.
3. Neon dashboard → SQL Editor → run `scripts/schema.sql` once.
4. Vercel → Redeploy so serverless functions pick up the env var.
5. Reload the site: subtitle flips to *"shared global board"*. Test across two
   browser profiles (normal + incognito): votes in one appear in the other.

## Deploy flow (live)

- Repo: `Hal-Franca/facemash`, default branch **`prod`**.
- Vercel project imports the repo, Production Branch = `prod`, live at
  `facemash-arena.vercel.app` (redirect from the original `-psi` domain).
- No env vars needed for local-mode deploys; `POSTGRES_URL` arrives via the
  Neon integration. Daily flow stays `feature/*` → `dev` → `staging` → `prod`.

Local dev against a DB: `npm i -g vercel; vercel env pull` (or set `POSTGRES_URL`
manually), then `npm run dev`.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest (Elo, ranking, catalog, filters)
npm run validate:roster  # 250-character data check
npm run lint
npm run build
```

## What it does

- 1v1 arena (`/dc/arena`), click to vote, Elo rating (K=32, base 1400 FIDE floor) — `src/lib/elo.ts:1`
- Rankings: Elo → wins → battles → A–Z, competition ranks (`#1, #2A, #2B…`),
  SC2-style tiers (bronze→diamond bands, Grandmaster = top-20 rows) — `src/lib/ranking.ts:1`
- Skip: both sides ⟳, keep-left, keep-right; per-card skip buttons under portraits
- Flip-card stats (adjustable speed, pinnable) + optional stats-below; hover/tap stat
  card: super name, civil name, universe, affiliation badge, teams, gender, species,
  first appearance (comic + issue + year), powers, Elo, bio
- Filters (affiliation / gender / species) + name search on roster + ladder
- Home top-20, full `/dc/roster` (image grid, A–Z/Z–A/rank sort, rank chips),
  full `/dc/ladder` (text board), character pages `/dc/characters/[id]` with tab titles
- Side drawer nav (Arena/Roster/Ladder) + DC logo header, per-page theme toggle,
  floating back-to-top, dark default + light mode, responsive mobile-first 3:4 portraits

## Data layout (extensible — don't redo later)

```text
src/data/
  types.ts                   # Character, Affiliation, Gender, Species
  index.ts                   # catalog[] aggregator (250: 118 heroes + 86 villains + 40 anti + 6 other)
  comics/dc/heroes.ts        # original 30 heroes
  comics/dc/villains.ts      # original 30 villains
  comics/dc/anti-heroes.ts   # original 28 anti-heroes (Ra's+Talia kept once as villains)
  comics/dc/heroes-extra.ts  # +88 heroes (+6 cosmic/other)
  comics/dc/villains-extra.ts# +56 villains (incl. Earth-3 Crime Syndicate)
  comics/dc/anti-heroes-extra.ts # +12 anti-heroes
  comics/dc/art.ts           # id → portrait file map (250 wired, 0 missing)
  comics/marvel/             # future — same shape
  anime/                     # future — same shape
public/images/comics/dc/"Super - Name".webp  # 251 portraits, uncropped webp
```

Add a universe by adding one folder + one import in `src/data/index.ts`.
Fields are validated by `scripts/validate-roster.ts`.

## Images & licensing

Character artwork © DC Comics, sourced via Comic Vine for identification on a
non-commercial fan/educational demo (see footer disclaimer). `image.url` is wired
for all 250 catalog characters; anything unmapped falls back to a consistent-size
initial placeholder (`CharacterPortrait`). Files stay uncropped and uniform-ish
(fit inside 600×800, 3:4 `object-cover`, top-anchored, per-character `focus`/`fit`
overrides where needed).

Raw art lives outside the repo; standardized copies are imported with:

```bash
node scripts/import-images.mjs "C:/path/to/raw/img"  # -> public/images/comics/dc/*.webp (fit inside 600x800, no crop; framing is CSS-only)
```

250 of 250 portraits wired via `src/data/comics/dc/art.ts` (id → file), 0 missing.
Fan-curated data: first appearances/powers verified for major characters,
best-effort for obscure ones.

Good comics-knowledge sources for *info/bio research* (not hotlinking):
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

See `KANBAN.md` + board (`.devtool/features/`). Shipped global board API
(`GET /api/ratings`, `POST /api/vote`, Vercel Postgres); remaining: provision DB,
admin CRUD, PT-BR i18n, Marvel + Anime universes, guessing game, tag system.
