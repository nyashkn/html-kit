---
name: explainer
when: use when explaining how something works: an abstract concept, a repo-specific feature, or a layered system
---

# explainer

**Use when:** explaining how something works — abstract concept (e.g. consistent hashing), a concrete repo-specific feature (e.g. how auth flows through *this* codebase), OR a layered system you peel from outside in (e.g. keychain unlock chain L1 → L8). One archetype, three flavours.

**Three exemplars:**
- `exemplar.html` — abstract / concept flavour (originally `concept-explainer`, upstream 15). Interactive demo, glossary, vs-alternatives table.
- `exemplar-concrete.html` — repo-specific feature flavour (originally `feature-explainer`, upstream 14). References real files, endpoints, modules.
- `exemplar-layered.html` — layer-peel flavour (vendored from `/tmp/explainer-A-keychain-layer-peel.html`, this session 2026-05-14). Vertical stack of N bands, dual-axis annotation rails (`request descends ↓` left, `data ascends ↑` right), hover-to-highlight, terse caption legend below decoding the colors.

**Data shape:** subject name, intuition paragraph, optional interactive demo OR ordered list of layers (for layered flavour), comparison vs alternatives or sibling features, glossary or file-reference list.

## Patterns
- `patterns/swimlane-flow.md` — multi-actor lanes × stage columns w/ failure-path edges.

## Gotchas

- (legacy): Pick the flavour by content shape: mentions specific files / endpoints → concrete. Generic principles → abstract. Sequential layers w/ flow direction → layered.
- (legacy): The interactive demo (abstract), annotated walkthrough (concrete), or band stack (layered) is the centerpiece — invest the visual budget there.
- (legacy): Hover-linked glossary or file references inline, not a footer dump.
- (legacy): Comparison table needs a "best for" column; concept-vs-concept tables are useless without one.
- (legacy): Layered flavour: dual-axis rails carry the narrative — don't bury them in CSS, they're the point. Caption below decodes color = down-arrow direction (e.g. olive=intent descends, clay=data ascends).
- 2026-05-13: artifacts with 6+ sections need sticky right-rail TOC (≥1280px) w/ IntersectionObserver active-section marking. Hide rail under 1280px, fall back to top pill nav.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.
- 2026-07-23: rendered a CDP scope doc from a spec doc; v2 needed because the SPEC itself contained false premises the render faithfully reproduced (a "field X is not a column" claim contradicted by two source files, and a "fixed" status that was actually still blocked). Fix: for concrete-flavour explainers sourced from a design doc, spot-verify the doc's load-bearing factual claims against the code it cites BEFORE rendering — a render inherits its source's errors and launders them into something that looks more authoritative. Also: pin the source commit SHA in the provenance block so a v2 can diff what changed.
- 2026-09-14: picked explainer (concrete) for a branch-review brief, user asked for v2 because (a) gap rows used `grid-template-columns:8px 1fr` with a `::before` stripe PLUS an empty `<span>`, so the text fell into the 8px column and rendered one word per line; (b) no drill-down, so detail was either missing or crammed inline. Fix: never mix a `::before` grid item with extra child elements in a 2-col grid (use border-left for severity stripes); for review/audit briefs use the click-to-open right drawer (`#side` + `data-k` + `?k=` deep link) with a team brand palette (custom fonts, single accent colour, custom box-state names) and a finding-as-headline h1. If the team has a brand palette, honor it (or set `<meta name="html-kit:palette" content="custom">` to opt the render audit out of palette-token checks) rather than forcing the Anthropic tokens.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
