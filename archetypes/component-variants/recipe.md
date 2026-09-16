---
name: component-variants
when: use when showing every size/state/intent of one component on a single sheet for design review
---

# component-variants

**Use when:** showing every size/state/intent of one component on a single sheet for design review.

**Data shape:** component name, list of variants (size × intent × state matrix), one rendered instance per cell.

## Gotchas

- (legacy): Use a real grid (rows=intent, cols=size) — don't list linearly.
- (legacy): Include disabled/loading/hover states; reviewers care about the edges.
- (legacy): Keep all variants on one page; no tabs or accordions.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.
- 2026-07-24: 10 variants where each cell is a full live-rendered email (iframe, ~400px tall) made "keep all on one page" genuinely unreviewable — user said "scrolling is very hard". Fix: campaign-level tabs + segment sub-tabs, one card visible at a time (SVG chart bars are also click-to-jump). The "no tabs" legacy rule holds for small/cheap cells (a button, a card chip); it breaks down once each cell is itself a heavy embedded artifact — judge by cell weight, not variant count.
- 2026-07-24: pre-rendering each variant server-side (Python regex substituting merge tags into a copied template string) silently dropped a `| round` Liquid filter the user had just added upstream — the preview showed stale/wrong content the source template didn't actually have. Fix: ship the RAW template source + RAW data row in the JSON payload, render client-side with a small generic filter-chain parser (splits on `|`, applies named filters, flags any unhandled filter with a visible marker instead of silently passing it through). For "preview what template X actually renders" archetypes, always render from the literal file bytes at display time — never hand-copy the template's substitution logic into the build script, it *will* drift from the source template's real filters.
- 2026-07-24: naively lowercasing an email-marketing platform's merge-field name to guess the CSV column name (`FIRSTNAME` → `firstname`) silently mismatched a real column (`first_name`), rendering the field's `default` fallback instead of the real value — invisible bug, no error, just quietly wrong data in every preview. Fix: pull the actual field-name mapping from the source of truth (the campaign config's `merge_fields:` block) and remap the row's keys before handing it to the renderer; never assume attribute-name-lowercased == column-name.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
