---
type: regex
target: trace
match: not_contains
pattern: '"name":"(Write|Edit)"[^\n]*(<script[^>]*\ssrc=|<link[^>]*rel=\\"?stylesheet|@import)'
---

Scoped to Write/Edit tool calls so recipe and exemplar text Claude reads
(which mentions `@import` as a rule) cannot cause a false failure.
Unverified against a real trace; trace lines are JSON, so quotes appear as `\"`.
