---
id: "hydration-fix-2026-09-26"
status: "done"
priority: "high"
assignee: "hal-franca"
dueDate: null
created: "2026-09-26T12:00:00.000Z"
modified: "2026-09-26T12:00:00.000Z"
completedAt: "2026-09-26T12:00:00.000Z"
labels: ["frontend", "bug"]
order: "a9"
---

# Hydration mismatch fix

`Math.random()` matchup + localStorage ratings + theme label differed between server and client. Fixed with a `useSyncExternalStore` mounted gate and skeleton placeholders; no `setState`-in-effect.
