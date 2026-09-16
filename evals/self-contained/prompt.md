---
tags: [free]
allowed_tools: [Read, Glob, Grep, Skill]
max_turns: 25
timeout_seconds: 600
---

Render this as a shareable html artifact — an explainer for teammates who've
never seen this system:

# How the reindex canary works

The canary sits between the query router and both indexes. On each request it
sends a shadow copy to the new index, diffs the top-10 results against the old
index's answer, and logs a relevance-delta score. Ops watches the score; a
30-minute rolling average above the alert threshold pages the on-call and
halts the traffic ramp automatically.
