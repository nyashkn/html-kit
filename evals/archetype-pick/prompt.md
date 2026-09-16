---
tags: [paid]
allowed_tools: [Read, Glob, Grep, Skill]
max_turns: 25
timeout_seconds: 600
---

Render this as an html artifact for the postmortem review:

# Incident 4821: checkout payment webhook backlog

Severity: SEV2 · Duration: 47m · 2026-09-12

## Timeline
- 14:02 — payment webhook consumer lag alert fires (p99 12s)
- 14:06 — on-call confirms consumer pods stuck on a retry loop
- 14:14 — root cause identified: downstream fraud-check API added a required
  field, consumer rejects every webhook and requeues it
- 14:31 — hotfix deployed making the new field optional client-side
- 14:49 — backlog drained, lag back to baseline

## Root cause
Fraud-check API shipped a breaking schema change without a version bump.

## Action items
- [ ] Owner: platform — pin fraud-check API to a versioned contract
- [ ] Owner: payments — add a schema-diff check to the webhook consumer's CI
