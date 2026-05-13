# design-system

**Use when:** rendering tokens (colors, type scale, spacing) pulled from a repo as live, copy-pasteable swatches.

**Data shape:** color tokens (name, hex, role), type scale (size, line-height, weight, sample), spacing scale (px or rem values), optional radii/shadows.

**Gotchas:**
- Each swatch should show the real color rendered + the token name + the value — all three.
- Add a "click to copy" affordance (small JS) for power users.
- Group by role (brand / semantic / neutral), not alphabetical.
