---
id: "develop-ci-branch-protection-2026-09-26"
status: "todo"
priority: "high"
assignee: "hal-franca"
dueDate: null
created: "2026-09-26T12:00:00.000Z"
modified: "2026-09-26T12:00:00.000Z"
completedAt: null
labels: ["devops"]
order: "a4"
---

# CI + branch protection (flow: feature/* → dev → staging → prod)

Branches `dev`/`staging`/`prod` exist locally (Vercel Production = `prod`). Add CI running lint/test/validate/build on PRs, require green checks + PR review, document the flow. Per-env Postgres (see `.env.example`) keeps test votes off prod data.
