# Delegation patterns — full deliberation

This is the long-form material extracted from SKILL.md Step 0 in v0.3.0 for
context-budget reasons. The condensed decision rule lives in SKILL.md Step 0.
Read here when an unusual case arises or when you need full rationale.

---

## Four-pattern table (from SKILL.md v0.2.x Step 0)

Four patterns. Pick by task signature, not reflex.

| Pattern | Model | Context handoff | Use when |
|---|---|---|---|
| **A. Inline (default)** | Opus (main) | None — main has it | User actively iterating · output <500 lines · no parallel work waiting · taste shaping in-thread |
| **B. Sonnet sub-agent** | Sonnet | Brief.md (lossy) | Narrow: ALL of (pre-spec'd output, pre-shaped data, one-shot, reference render exists) |
| **C. Opus sub-agent** | Opus (peer) | Verbose brief w/ full convo excerpt + reference render path | Main has parallel work · context budget tight (>70%) · output >500 lines · taste matters but main blocked |
| **D. Agent team** | Opus × N | Shared task list + msg-passing | Render is synthesis step in a pipeline already running sub-agents (`/search:deep`, `/council`) · multi-artifact set (3+ related HTML files) |

**Hard signals:**
- Brief longer than the diff from inline render → A.
- Would need to paste conversation transcript verbatim → A or C (never B).
- Already running ≥2 sub-agents in this turn → D (don't fresh-delegate).
- Output >1500 lines OR main near compaction → C minimum, D if pipeline.

**Never Haiku** for HTML >300 lines (loses global coherence — callouts drift,
emphasis flattens). Haiku acceptable only for fully-deterministic <500 line
templating w/ no taste calls.

**Pipeline integration hooks:**
- `/search:deep` synthesis → spawn render-teammate w/ access to research-agent
  outputs (D, not C).
- `/council` synthesis → render-teammate sees all persona outputs directly via
  shared task list.
- Multi-artifact deliveries → 1 main + N render-teammates parallel.

**Delegation skeleton (B/C):**
1. Brief at `/tmp/render-brief-<topic>.md`:
   - Source content **verbatim** (summarization kills intent for B/C)
   - Archetype slug + reason
   - Output path
   - Reference render path (the prior aesthetic anchor)
   - User constraints (palette, voice, sections to emphasize)
2. Spawn `general-purpose` sub-agent. `model: opus` for C, `model: sonnet` for B:
   > "Read /tmp/render-brief-<topic>.md. Read the html-kit SKILL at
   > ~/.claude/skills/html-kit/SKILL.md. Follow Steps 2-9. Report the
   > absolute output path. Nothing else."
3. `run_in_background: true` only if user signaled bg or main has parallel
   work. Default foreground.
4. Main runs `open <path>` and Step 9 follow-up.

**Agent team skeleton (D):** see Claude Code agent-teams docs
(https://code.claude.com/docs/en/agent-teams). Give the render-teammate
access to upstream sub-agent outputs via shared task list, not a copy-paste
brief.

---

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
