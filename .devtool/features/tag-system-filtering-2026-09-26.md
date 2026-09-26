---
id: "tag-system-filtering-2026-09-26"
status: "backlog"
priority: "medium"
assignee: "hal-franca"
dueDate: null
created: "2026-09-26T12:00:00.000Z"
modified: "2026-09-26T12:00:00.000Z"
completedAt: null
labels: ["frontend", "backend", "database"]
order: "a5"
---

# Tag system + per-tag ladders

Many-to-many tags (Bat-Family, Green Lantern Corps, Robin mantle, Speedsters, Titans...) so voters can crown the "best" of a tag, not just affiliation/gender/species.

- Frontend: tag picker in arena + rankings filtered per tag, tag badges on cards, tag pages.
- Backend: tags table + character_tags join, API filters, per-tag Elo boards.
- Database: migration, seed tags from the existing `teams` field, uniqueness + slug constraints.
