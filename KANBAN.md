# Kanban — Facemash (Scrum / Agile)

Cards live in the **Kanban Markdown board**, not in this file:
`.devtool/features/` (22 cards, mirrored from the plan below).

## Running the board (VS Code + Kanban Markdown by LachyFS)

1. Install — search `Kanban Markdown` in the Extensions view.
2. Open — command palette → `Open Kanban Board` (or the sidebar icon).
3. Columns — Backlog, To Do, In Progress, Review, Done (defaults, no config needed
   since cards sit in the default `.devtool/features/` directory).
4. Move work — drag cards between columns, or press `N` for a new card. Moving a
   card edits its markdown file (and vice versa); everything is committed to git.
5. Card format — one `.md` per feature with YAML frontmatter
   (`id, status, priority, assignee, dueDate, created, modified, completedAt, labels, order`),
   finished cards under `done/`. Keep the exact serialization (double-quoted strings,
   bare `null`, inline label arrays) so the extension keeps parsing them.

## Board upkeep

- In Progress holds at most 2 cards (solo WIP limit).
- A card moves to Done only when lint + test + `validate:roster` + build pass,
  responsive + both themes checked.
- Priorities: backend + deploy = high; content/data expansions = medium;
  i18n/PWA/Glicko = low (see card badges).
- Sprint rhythm: weekly; plan from To Do, review Done, re-file leftovers to Backlog.

## Current snapshot (see board for live state)

- Shipped: scaffold, data model, 250-character catalog (118 heroes + 86 villains + 40 anti-heroes
  + 6 other) with wired portraits,
  Elo engine + tests, arena + rankings + filters + pagination, dark/light +
  responsive, flip cards + badges, hydration fix, README/validation/green builds,
  footer + image disclaimer.
- In progress: Vercel deploy, licensed portrait upgrades.
- Shipped this round: README story, DC logo header + side drawer (Arena/Roster/Ladder),
  home top-20 lock, `/roster` (images, A–Z/Z–A/rank, filters, rank chips), `/ladder` (full text board).
- Next (To Do): global votes backend, admin CRUD, anti-bot, Playwright E2E,
  `develop` + CI + branch protection.
- Backlog: PT-BR i18n, Marvel universe, Anime, PWA/share/SEO, Glicko-2 + seasons.
