---
type: regex
target: last_message
pattern: 'collapse'
flags: i
---

"collapse" is a distinctive word from the fixture's reject annotation
("too many phases, collapse to 3" on lane-2-agent). Its presence in the
final reply means Claude actually read and surfaced the fixture's
annotation content, not just called the skill and said nothing useful.
