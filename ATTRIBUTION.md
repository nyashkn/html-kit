# Third-party attribution

All HTML exemplars under `archetypes/<slug>/exemplar*.html` are vendored from
[ThariqS/html-effectiveness](https://github.com/ThariqS/html-effectiveness).
That upstream repo relicensed from MIT to Apache-2.0 on 2026-05-18; which
license applies to a given exemplar depends on when it was vendored (see the
two sections below and each file's own header comment).

## Vendored exemplars — MIT (`thariqs/html-effectiveness`, root-level)

The exemplars vendored on 2026-05-14 (before the upstream relicense) are:

- **Source:** [ThariqS/html-effectiveness](https://github.com/ThariqS/html-effectiveness)
- **License:** MIT

Each vendored file carries an inline provenance comment at the top recording
the exact upstream filename it derives from, e.g.:

```html
<!-- source: thariqs/html-effectiveness 03-code-review-pr.html | MIT license -->
```

See those per-file comments for which upstream document each exemplar maps to.
The exemplars have been adapted (Anthropic palette tokens, `data-component`
annotations, structural trims) for use as html-kit archetype templates; the
original MIT terms continue to apply to the upstream-derived portions.

## Vendored exemplars — Apache-2.0 (`thariqs/html-effectiveness`, `unknowns/`)

Upstream relicensed from MIT to Apache-2.0 on 2026-05-18. The 11 files below
were vendored on 2026-09-05 (commit `82fa96f`), after the relicense, from the
`unknowns/` sub-page — they carry Apache-2.0 in their own file headers and are
**unmodified** copies of the upstream source (no palette/structural edits):

| html-kit file | Upstream source |
|---|---|
| `archetypes/blindspot-pass/exemplar.html` | `unknowns/01-blindspot-pass.html` |
| `archetypes/vocab-teacher/exemplar.html` | `unknowns/02-color-grading-explainer.html` |
| `archetypes/design-reaction-review/exemplar.html` | `unknowns/03-design-directions.html` |
| `archetypes/throwaway-mock/exemplar.html` | `unknowns/04-toolbar-mock.html` |
| `archetypes/intervention-brainstorm/exemplar.html` | `unknowns/05-churn-brainstorm.html` |
| `archetypes/requirements-interview/exemplar.html` | `unknowns/06-interview.html` |
| `archetypes/reference-port-verify/exemplar.html` | `unknowns/07-reference-port.html` |
| `archetypes/tweakable-plan/exemplar.html` | `unknowns/08-implementation-plan.html` |
| `archetypes/implementation-notes/exemplar.html` | `unknowns/09-implementation-notes.html` |
| `archetypes/buy-in-pitch/exemplar.html` | `unknowns/10-pitch-doc.html` |
| `archetypes/merge-quiz/exemplar.html` | `unknowns/11-change-quiz.html` |

Each file's header comment reads:

```html
<!-- Copyright 2026 Anthropic PBC · SPDX-License-Identifier: Apache-2.0 -->
```

Upstream copyright: **Copyright 2026 Anthropic PBC**. Full license text:
[`LICENSES/Apache-2.0.txt`](LICENSES/Apache-2.0.txt). Upstream carries no
`NOTICE` file (checked at repo root), so there is nothing to reproduce under
Apache-2.0 §4(d).

## Other dependencies

Runtime/dev dependencies are declared in `package.json` and carry their own
licenses (Playwright — Apache-2.0; Pagefind — MIT). These are pulled via the
package manager and are not vendored into this repository.
