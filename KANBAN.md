# Kanban — Facemash (Scrum / Agile)

Sprint 0 (done): scaffold Next.js+TS, 88-character DC roster (30 heroes + 30 villains +
28 anti-heroes; Ra's+Talia deduped as villains), arena + Elo + rankings +
filters + skip + stat card (universe/teams/bio) + dark/light + responsive,
README, unit tests, lint, roster validation. Vercel-ready (SSG + headers).

## Done

- [x] Scaffold `C:\GitHub\facemash` (Next.js 16, TS, Tailwind, ESLint)
- [x] Data model `Category > Universe > Affiliation` (`src/data/*`)
- [x] Full catalog: 226 characters (110 heroes + 78 villains + 38 anti-heroes)
  via `heroes-extra`, `villains-extra`, `anti-heroes-extra`; every entry has
  portrait wired (`art.ts`), bio, powers, first appearance, teams, universe
- [x] Elo engine + tests (`src/lib/elo.ts`, `__tests__/elo.test.ts`)
- [x] Arena vote + skip both/one-side + rankings + filters + char pages
- [x] Dark default + light toggle + responsive 3:4 portraits
- [x] README + `validate:roster` + lint/test/build green

## Doing

- [ ] Deploy to Vercel from `main`, verify mobile + light mode
- [ ] Replace placeholder portraits with licensed 600×800 webp (see README)

## To Do (Sprint 1–2)

- [ ] Global votes backend (Vercel KV or Cloudflare D1) + rate limiting
- [ ] Admin CRUD for characters (protected route)
- [ ] Anti-bot: fingerprint + cooldown, audit log
- [ ] E2E: Playwright vote → ranking persists on reload
- [ ] `develop` branch + CI (lint/test/build/validate) + branch protection

## Backlog

- [ ] PT-BR i18n (EN-only for now)
- [ ] Marvel universe (`src/data/comics/marvel/*`)
- [ ] Anime titles/characters (`src/data/anime/*`)
- [ ] PWA / share-card / SEO per character
- [ ] Glicko-2 or decay, seasons leaderboard

## Scrum cadence (solo-friendly)

Weekly sprint: plan from To Do → Doing (WIP ≤ 2) → Done with green checks.
Definition of done: lint + test + validate:roster + build pass, responsive +
both themes checked.
