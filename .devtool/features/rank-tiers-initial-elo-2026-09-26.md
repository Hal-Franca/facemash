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

# Rank tiers + ranking display rules

Base 1400 (FIDE floor). Order: Elo → wins → total battles → A–Z. Competition ranks with letter suffixes (`#1, #2A, #2B, #4A, #4B, #6`).

Visible tiers bronze/silver/gold/platinum/diamond by Elo band (Diamond 1800+, Platinum 1600+, Gold 1400+, Silver 1200+ — tunable in `src/lib/ranking.ts`). Grandmaster = first 20 display rows of the filtered board meeting a 5-battle gate; boundary ties never split. All rules recompute per filter and port to SQL (ORDER BY + window functions).
