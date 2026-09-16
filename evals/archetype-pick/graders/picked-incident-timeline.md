---
type: llm
focus: trace
---

PASS if the transcript shows Claude reading, referencing, or applying the
`incident-timeline` archetype (e.g. opening `archetypes/incident-timeline/recipe.md`
or its `exemplar.html`, or otherwise naming `incident-timeline` as the chosen
pattern) when deciding how to render this SEV2 postmortem content.

FAIL if a different archetype was picked, or if no archetype selection step
is visible in the transcript at all.
