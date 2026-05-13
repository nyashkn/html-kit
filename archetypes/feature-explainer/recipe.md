# feature-explainer

**Use when:** explaining how a specific feature works in a specific repo (e.g. "how rate limiting works here") — TLDR, request-path steps, config snippets, FAQ.

**Data shape:** feature name, TLDR (3-5 lines), step list of the request/data path, tabbed config snippets per environment, FAQ items.

**Gotchas:**
- TLDR box at top in `--g100` background — readers who only read that should still leave informed.
- Steps as collapsible if they have deep detail; otherwise inline numbered.
- Tabbed code (dev/staging/prod) with JS-swapped active tab — readers compare them.
