---
id: "mobile-flip-toggle-2026-09-26"
status: "done"
priority: "low"
assignee: "hal-franca"
dueDate: null
created: "2026-09-26T12:00:00.000Z"
modified: "2026-09-26T12:00:00.000Z"
completedAt: "2026-09-26T12:00:00.000Z"
labels: ["frontend", "mobile"]
order: "a12"
---

# Drop flip toggle on touch devices

Hover-flip can't work on mobile/tablet, so the header Flip toggle is dead weight there — hide it below `sm:` (or behind hover-capability media query). Touch users get stats via Stats-below toggle + per-card pin, which already work. Keep toggle on desktop.
