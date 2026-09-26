---
id: "global-votes-backend-2026-09-26"
status: "todo"
priority: "high"
assignee: "hal-franca"
dueDate: null
created: "2026-09-26T12:00:00.000Z"
modified: "2026-09-26T12:00:00.000Z"
completedAt: null
labels: ["backend", "database"]
order: "a0"
---

# Global votes backend

Votes currently live in `localStorage` (per-browser). Add API routes + Postgres/D1: server-side Elo (reuse `src/lib/elo.ts` math), shared global rankings, localStorage as cache.
