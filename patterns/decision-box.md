# Pattern: decision-box

Cross-archetype component. Use at the **end of any decision-bearing artifact**
(plan, comparison, exploration) to give the reader an actionable verdict +
follow-up CTA in one block.

## When to use

- Artifact contains 2+ choices the reader needs to confirm/override
- Final section requires "do this next" framing, not just "here's the analysis"
- Reader will respond w/ accept/override decisions (often via follow-up `AskUserQuestion`)

## Spec

- 4px clay left-border (`border-left: 4px solid var(--clay)`)
- Paper background, rounded right side (`border-radius: 0 12px 12px 0`)
- Max-width ~900px (don't stretch full container)
- Serif H2 ("Default path forward" / "Recommendation" / "Verdict")
- Body: short paragraph framing the default path
- Ordered list (`<ol>`) of numbered decisions, each w/ inline `<code>` for
  slugs / file paths / option labels
- Closing CTA paragraph ("Reply with overrides per pair…" / "Confirm and
  I'll apply…") — tells reader exactly how to respond

## Exemplar fragment

```html
<aside class="verdict">
  <h2>Default path forward</h2>
  <p>
    Accept the four ★ recommended pills as-is and the package ships unchanged
    except one slug rename and one deferred token decision:
  </p>
  <ol>
    <li>Pair 1 — <strong>keep both</strong> (split by content type)</li>
    <li>Pair 2 — <strong>keep both</strong> (split by voice)</li>
    <li>Pair 3 — <strong>collapse</strong> <code>foo</code> + <code>bar</code> → <code>foobar</code></li>
  </ol>
  <p style="margin-top: 12px;">
    Reply with overrides per pair (or "all defaults") and I'll apply, recommit,
    and tag <code>v0.1.0</code>.
  </p>
</aside>
```

## CSS

```css
aside.verdict {
  border-left: 4px solid var(--clay);
  background: var(--paper);
  border-radius: 0 12px 12px 0;
  padding: 22px 26px;
  max-width: 900px;
}
aside.verdict h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 22px;
  color: var(--slate);
  margin-bottom: 10px;
}
aside.verdict p { font-size: 14.5px; margin-bottom: 8px; color: var(--g700); }
aside.verdict ol { margin: 8px 0 0 22px; font-size: 14px; color: var(--g700); }
aside.verdict ol li { margin-bottom: 4px; }
aside.verdict code {
  font-family: var(--mono);
  font-size: 0.92em;
  background: var(--g100);
  padding: 1px 6px;
  border-radius: 4px;
}
```

## Pairs well with

- `AskUserQuestion` follow-up (mirror the `<ol>` items as questions)
- Summary strip at top w/ "Skip to verdict →" pill linking to this section's `id`
- Long artifacts where reader needs to skim → decide → respond

## Ancestry

Promoted from `hamilton-restate-plan-v2.html#s09` (this session, 2026-05-13)
after KN flagged it as the detail level / framing they prefer for closing
sections.
