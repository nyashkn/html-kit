# html-kit

Reusable HTML artifact patterns for Claude Code sessions. Turns synth, plans,
specs, and decision docs into polished single-page artifacts using the
Anthropic-palette archetypes from `thariqs/html-effectiveness`. Skill-only —
no CLI, no build step. Sibling project of `spec-kit/`.

## Structure

```
html-kit/
├── archetypes/          # 20 vendored exemplars, one per directory
│   └── <slug>/
│       ├── exemplar.html   # verbatim copy + MIT source comment
│       └── recipe.md       # when to use, expected data, gotchas
├── tokens/
│   └── anthropic-palette.css   # shared CSS custom properties (reference)
├── skill/
│   └── html-kit/
│       └── SKILL.md     # router skill — picks archetype + adapts pattern
├── .gitignore
└── README.md
```

## Attribution

Exemplars vendored from
[thariqs/html-effectiveness](https://github.com/ThariqS/html-effectiveness)
under MIT license. See per-file `<!-- source: ... -->` comments at top of each
`exemplar.html`.

## Quick start

Invoke `/html-kit` in Claude Code with your source content + desired artifact
path. The skill browses `archetypes/`, picks the best fit by reading
`recipe.md`, learns the pattern from `exemplar.html`, and renders new HTML
adapted to your data.

## Roadmap (not in v0)

- Per-archetype skills (`/html-kit:plan`, `/html-kit:incident`, etc.)
- CLI extraction for non-Claude consumers
- spec-kit adapter (auto-render approved specs as `implementation-plan` artifacts)
