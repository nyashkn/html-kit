# component-variants

**Use when:** showing every size/state/intent of one component on a single sheet for design review.

**Data shape:** component name, list of variants (size × intent × state matrix), one rendered instance per cell.

**Gotchas:**
- Use a real grid (rows=intent, cols=size) — don't list linearly.
- Include disabled/loading/hover states; reviewers care about the edges.
- Keep all variants on one page; no tabs or accordions.
