# Pattern: option-card

Cross-archetype component. Use anywhere a decision-bearing artifact presents
2-4 distinct options the reader must compare and choose between. Replaces a
`<ul>` markdown bullet list of options with a scannable side-by-side grid.

## When to use

- Artifact contains 2-4 discrete options with meaningfully different trade-offs
- Reader needs to compare options side-by-side, not read them sequentially
- You would otherwise reach for a `<ul>` or `<ol>` of option descriptions
- Replaces bullet lists of options in: exploration-code-approaches,
  exploration-visual-designs, implementation-plan (decision branches),
  pr-review (approach suggestions)

## Spec

- **Layout:** 3-column grid (`repeat(3, minmax(0, 1fr))`), auto-collapses to
  1 column below 980px
- **Card background:** white (`var(--paper)` / `#FFFFFF`)
- **Border:** `1.5px solid var(--gray-300)` (`#D1CFC5`)
- **Radius:** `12px`
- **Padding:** `20-24px` inner padding
- **Gap:** `20-28px` between cards
- **`.hot` modifier:** recommended option gets `border: 2px solid var(--clay)`
  to visually distinguish it — use on exactly one card when there is a clear
  recommended path

## Exemplar fragment

```html
<div class="grid" data-component="approach-grid">

  <div class="card" data-component="proposal-card">
    <span class="tag">Approach</span>
    <span class="num">01</span>
    <h3>Inline useEffect + setTimeout</h3>
    <div class="meta">Debounce logic lives directly inside the component.</div>
    <p>
      Zero new abstractions. Easy to step through in devtools. Reuse is low —
      logic duplicates everywhere search exists.
    </p>
  </div>

  <div class="card hot" data-component="proposal-card">
    <span class="tag">Approach ★ Recommended</span>
    <span class="num">02</span>
    <h3>Custom useDebounce hook</h3>
    <div class="meta">Extract the timer into a shared hook under <code>src/hooks/</code>.</div>
    <p>
      One definition, reused everywhere. Testable in isolation. Adds ~200 bytes
      to the bundle.
    </p>
  </div>

  <div class="card" data-component="proposal-card">
    <span class="tag">Approach</span>
    <span class="num">03</span>
    <h3>lodash.debounce via useMemo</h3>
    <div class="meta">Wrap lodash in a stable memoized ref.</div>
    <p>
      Minimal boilerplate if lodash is already a dependency. Adds ~4 kb if not.
      Harder to tree-shake.
    </p>
  </div>

</div>
```

## CSS

```css
.grid[data-component="approach-grid"] {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 980px) {
  .grid[data-component="approach-grid"] {
    grid-template-columns: 1fr;
  }
}

.card[data-component="proposal-card"] {
  background: var(--paper, #FFFFFF);
  border: 1.5px solid var(--gray-300, #D1CFC5);
  border-radius: 12px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card[data-component="proposal-card"].hot {
  border: 2px solid var(--clay, #D97757);
}

.card[data-component="proposal-card"] .tag {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500, #87867F);
}

.card[data-component="proposal-card"] .num {
  display: inline-block;
  font-family: var(--mono);
  font-size: 12px;
  background: var(--oat, #E3DACC);
  color: var(--slate, #141413);
  padding: 2px 8px;
  border-radius: 8px;
  margin-right: 8px;
  vertical-align: 3px;
}

.card[data-component="proposal-card"] h3 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 18px;
  color: var(--slate, #141413);
  margin: 0;
}

.card[data-component="proposal-card"] .meta {
  font-size: 13px;
  color: var(--gray-500, #87867F);
}

.card[data-component="proposal-card"] p {
  font-size: 14px;
  color: var(--gray-700, #3D3D3A);
  line-height: 1.55;
  flex: 1;
}
```

## Pairs well with

- `decision-box` — follow the option grid with a verdict box naming which
  card is the default path forward
- `AskUserQuestion` follow-up — mirror each card as a question option so the
  reader can confirm or override the recommended choice
- Status-strip TL;DR at the top — one-line summary of what the options are
  before the reader hits the grid

## Ancestry

Promoted from html-kit-v0.3.0-spec render 2026-05-18, sourced from
`thariqs/01-exploration-code-approaches` exemplar (`.approaches` / `.approach`
grid, lines 88-107 + 99-107 of exemplar CSS). Generalised to `data-component`
attributes and palette vars for cross-archetype reuse.
