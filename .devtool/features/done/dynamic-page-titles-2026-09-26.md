---
id: "dynamic-page-titles-2026-09-26"
status: "backlog"
priority: "low"
assignee: "hal-franca"
dueDate: null
created: "2026-09-26T12:00:00.000Z"
modified: "2026-09-26T12:00:00.000Z"
completedAt: null
labels: ["frontend", "seo"]
order: "a8"
---

# Dynamic title bar per page

Browser tab title follows the open page so multiple tabs stay identifiable: home stays `Facemash — DC Supers`, character pages become `Facemash - DC - {Name}` / `{Super} ({Real})`, e.g. `Green Lantern (Hal Jordan)`. Use `generateMetadata` on `/characters/[id]` (+ future roster/game pages).
