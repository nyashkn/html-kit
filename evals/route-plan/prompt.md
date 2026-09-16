---
tags: [free]
allowed_tools: [Read, Glob, Grep, Skill]
max_turns: 25
timeout_seconds: 600
---

Render this rollout plan as a shareable html artifact:

# Q3 search reindex rollout

**Owner:** infra team · **Target:** 2026-10-01

## Milestones
1. Shadow-index new pipeline against prod traffic (read-only) — 2026-09-20
2. Cut over 10% of query traffic to new index — 2026-09-25
3. Cut over 100% of query traffic — 2026-09-30
4. Decommission old index — 2026-10-05

## Risks
- Relevance regression on long-tail queries — mitigate with a canary dashboard
- Reindex job doubles storage cost during the overlap window

## Owners
- Shadow index: A. Osei
- Cutover: B. Fernandez
- Decommission: A. Osei
