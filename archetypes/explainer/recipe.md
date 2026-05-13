# explainer

**Use when:** explaining how something works — abstract concept (e.g. consistent hashing) OR a concrete repo-specific feature (e.g. how auth flows through *this* codebase). One archetype, two flavours.

**Two exemplars:**
- `exemplar.html` — abstract / concept flavour (originally `concept-explainer`, upstream 15). Interactive demo, glossary, vs-alternatives table.
- `exemplar-concrete.html` — repo-specific feature flavour (originally `feature-explainer`, upstream 14). References real files, endpoints, modules.

**Data shape:** subject name, intuition paragraph, optional interactive demo, comparison vs alternatives or sibling features, glossary or file-reference list.

**Gotchas:**
- Pick the flavour by content: mentions specific files / endpoints → concrete exemplar. Generic principles → abstract exemplar.
- The interactive demo (abstract) or annotated walkthrough (concrete) is the centerpiece — invest the JS budget there.
- Hover-linked glossary or file references inline, not a footer dump.
- Comparison table needs a "best for" column; concept-vs-concept tables are useless without one.
