# annotated-pull-request

**Use when:** rendering a PR review (reviewer voice) — diff with margin notes, severity tags, jump links. Reader is the PR author or another reviewer.

**Data shape:** PR metadata (title, num, author), summary verdict, list of files w/ hunks, per-hunk comments tagged severity (nit/suggest/block), top-level summary table.

**Gotchas:**
- Keep diff hunks readable on narrow screens — don't fix-width to terminal columns.
- Severity color: olive=nit, clay=suggest, rose=block. Stay consistent.
- Give a verdict pill (approve / request-changes / comment) at top; readers skim for it.
