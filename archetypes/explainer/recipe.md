# explainer

**Use when:** explaining how something works — abstract concept (e.g. consistent hashing), a concrete repo-specific feature (e.g. how auth flows through *this* codebase), OR a layered system you peel from outside in (e.g. keychain unlock chain L1 → L8). One archetype, three flavours.

**Three exemplars:**
- `exemplar.html` — abstract / concept flavour (originally `concept-explainer`, upstream 15). Interactive demo, glossary, vs-alternatives table.
- `exemplar-concrete.html` — repo-specific feature flavour (originally `feature-explainer`, upstream 14). References real files, endpoints, modules.
- `exemplar-layered.html` — layer-peel flavour (vendored from `/tmp/explainer-A-keychain-layer-peel.html`, this session 2026-05-14). Vertical stack of N bands, dual-axis annotation rails (`request descends ↓` left, `data ascends ↑` right), hover-to-highlight, terse caption legend below decoding the colors.

**Data shape:** subject name, intuition paragraph, optional interactive demo OR ordered list of layers (for layered flavour), comparison vs alternatives or sibling features, glossary or file-reference list.

**Gotchas:**
- Pick the flavour by content shape: mentions specific files / endpoints → concrete. Generic principles → abstract. Sequential layers w/ flow direction → layered.
- The interactive demo (abstract), annotated walkthrough (concrete), or band stack (layered) is the centerpiece — invest the visual budget there.
- Hover-linked glossary or file references inline, not a footer dump.
- Comparison table needs a "best for" column; concept-vs-concept tables are useless without one.
- Layered flavour: dual-axis rails carry the narrative — don't bury them in CSS, they're the point. Caption below decodes color = down-arrow direction (e.g. olive=intent descends, clay=data ascends).
