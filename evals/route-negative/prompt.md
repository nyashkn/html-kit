---
tags: [free]
allowed_tools: [Read, Skill]
max_turns: 10
---

Summarize this in plain markdown, no styling needed, just a bullet list I can paste into a ticket:

We shipped the v2 auth migration this week. All existing sessions were force-logged-out
on 2026-09-14. Support saw a 3% spike in "can't log in" tickets that resolved itself
within 6 hours as users re-authenticated. No data loss, no rollback needed.
