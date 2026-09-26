---
id: "rank-tiers-initial-elo-2026-09-26"
status: "backlog"
priority: "medium"
assignee: "hal-franca"
dueDate: null
created: "2026-09-26T12:00:00.000Z"
modified: "2026-09-26T12:00:00.000Z"
completedAt: null
labels: ["backend", "frontend"]
order: "a9"
---

# Rank tiers on top of Elo + initial Elo calibration

Visible tiers (bronze, silver, gold, platinum, diamond, ...) derived from Elo bands, shown as badges in arena/rankings/profiles. Research optimal initial Elo + K-factor so new characters place sensibly and early votes don't swing wildly. Tiers must survive the SQL migration (computed server-side).
