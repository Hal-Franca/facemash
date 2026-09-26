---
id: "portrait-import-wiring-2026-09-26"
status: "done"
priority: "high"
assignee: "hal-franca"
dueDate: null
created: "2026-09-26T12:00:00.000Z"
modified: "2026-09-26T12:00:00.000Z"
completedAt: "2026-09-26T12:00:00.000Z"
labels: ["frontend", "data"]
order: "a7"
---

# Portrait import + wiring

`scripts/import-images.mjs` standardizes raw art to uncropped webp (fit inside 600x800). All 226 catalog portraits wired via `art.ts` id-to-file map with `encodeURI` at render. Framing is CSS-only.
