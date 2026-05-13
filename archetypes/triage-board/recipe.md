# triage-board

**Use when:** ordering N tickets/items across columns (Now / Next / Later / Cut) with drag-and-drop, then exporting the result.

**Data shape:** list of tickets (id, title, owner, size estimate), set of column names, initial assignment per ticket.

**Gotchas:**
- HTML5 drag-and-drop is fine for this scale; don't pull in a library.
- Column counts at top of each column update live as items move.
- "Copy as markdown" button at top — the export is half the value of the artifact.
