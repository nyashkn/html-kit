# Third-party attribution

## Vendored exemplars — `thariqs/html-effectiveness`

The HTML exemplars under `archetypes/<slug>/exemplar*.html` are vendored from:

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

## Other dependencies

Runtime/dev dependencies are declared in `package.json` and carry their own
licenses (Playwright — Apache-2.0; Pagefind — MIT). These are pulled via the
package manager and are not vendored into this repository.
