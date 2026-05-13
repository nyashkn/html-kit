# Delegation rationale for html-kit Step 0

Read this when deciding render pattern for an unusual case (multi-artifact,
pipeline integration, very long render) or when explaining the rule to the user.

For routine renders, the cheatsheet in SKILL.md Step 0 is enough.

## How the 4-pattern fork was reached

Council deliberation 2026-05-14 — 7 personas (Torvalds, Munger, Karpathy,
Taleb, Kahneman, Rams, Lao-Tzu) parallel fan-out on the question "should
HTML rendering be inline Opus, Sonnet sub-agent, or Haiku sub-agent?".

**6/7 verdict: inline Opus default.** Karpathy dissented (Sonnet bg w/
pre-shaped data).

Convergent rule across the 7:
- Render is taste work — sectioning, voice, emphasis, what to omit
- Taste lives in conversation context that doesn't compress into a brief
- Brief-loss is the silent failure no one measures (Taleb)
- Hamilton plan v1→v2→v3 evidence: all inline Opus, all required visibility
  into rendered output to refine
- Sub-agent renders technically-valid HTML that misses the point user wanted

## What council missed (added 2026-05-14 by KN)

Council reasoned about model-tier (Opus/Sonnet/Haiku) but skipped the
orthogonal axis: **peer-agent vs subordinate-agent**.

If you spawn an Opus sub-agent w/ a verbose brief (full conversation excerpt
+ reference render path), brief-loss is dramatically reduced. The render
agent is a peer, not a subordinate — taste survives because the model tier
matches main.

This unlocks two more patterns:

**Pattern C (Opus sub-agent w/ verbose brief)** — when main has parallel
work, context budget is tight, or output >500 lines. Cost: 2× Opus tokens.
Win: main agent unblocked + context budget protected.

**Pattern D (agent team w/ shared context)** — when render is the
synthesis step in a pipeline already running sub-agents (e.g.
`/search:deep` spawns research agents → synthesis-render agent should be a
teammate w/ shared context, not a fresh delegation w/ stale brief).

## Anti-patterns observed

- **Reflexive delegation.** Spawning a sub-agent because CLAUDE.md says
  "MUST delegate" — without checking if the brief can carry intent.
- **Sonnet middle-ground.** Kahneman: "worst of both — not cheap enough to
  be disposable, not deep enough to recover lost taste context". Skip Sonnet
  for taste work; pick A or C.
- **Haiku for >300 line HTML.** Loses global coherence: callouts drift,
  emphasis flattens, CSS tokens fragment. Karpathy assessment: Haiku
  satisfies local constraints, fails narrative arc.
- **Lossy summarization in briefs.** If you summarize source content into
  the brief instead of pasting verbatim, intent dies. Pattern C only works
  with verbose briefs.

## When to revisit this rule

Re-evaluate inline-default if:
- Renders consistently exceed 1500 lines (context budget tax becomes real)
- Multi-artifact deliveries (3+ related HTML files) become routine — agent
  teams sweet spot
- Sonnet 4.7+ closes the taste gap empirically (re-run a hamilton-style
  iteration test)
- A new render archetype is purely templating w/ zero taste calls (e.g.
  data-table from JSON) — Sonnet/Haiku reclaim the trivial-render slot

## Sources

- Council session 2026-05-14, this conversation
- Hamilton plan v1→v2→v3 iteration record (this session)
- html-kit-v0-review.html render (this session, inline Opus, single shot)
- CLAUDE.md multi-agent delegation rules (`~/.claude/CLAUDE.md`)
- Claude Code agent-teams docs: https://code.claude.com/docs/en/agent-teams
