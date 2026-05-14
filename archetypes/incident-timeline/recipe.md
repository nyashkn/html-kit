# incident-timeline

**Use when:** post-mortem of an outage — minute-by-minute timeline, log excerpts, follow-up checklist.

**Data shape:** incident id/title, severity, duration, summary, ordered events (timestamp + actor + description), root cause section, action items w/ owners.

**Gotchas:**
- Use a vertical timeline rail (left edge dots + lines) — readers expect chronology to look like time.
- Long log excerpts: wrap in `<details>` so they don't dominate the page.
- Action items at the BOTTOM with checkbox affordance and owners — that's the artifact's lasting value.

## Patterns
- `patterns/swimlane-flow.md` — multi-actor lanes × stage columns w/ failure-path edges.
