---
type: regex
target: last_message
pattern: '^\s*[-*]\s+\S'
flags: m
---

Companion to no-skill-fired.md, which only asserts the skill was never
called — a run that produces zero output would pass that grader trivially.
This asserts Claude actually did the requested task (a markdown bullet
list), so "didn't fire the skill" can't be satisfied by doing nothing.
