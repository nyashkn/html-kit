# Pattern: swimlane-flow

Cross-archetype inline-SVG swimlane: N horizontal lanes × M stage columns, color-coded edges (happy/dashed-failure/dotted-shared), legend strip, blast-radius dot overlays.

## When to use

- Visualizing a process that splits across ≥2 roles/actors over time (onboarding, incident, hand-off, cutover, intervention pipelines).
- The story needs *both* sequence (left→right stages) and *responsibility* (top/bottom lanes) at one glance.
- Some edges are exceptional (failure / escalation / shared artifact) and deserve distinct stroke.

Do not use for single-actor flows — use plain `annotated-flowchart` instead. Do not use when the process is purely sequential without role-switching — use `tldr-flow-strip`.

## Spec

- Outer wrap: white card, 1px `--g300` border, 6px radius, 18px pad, `overflow-x:auto` so SVG can exceed wrap width on narrow viewports.
- Legend strip above SVG: mono 10.5px UPPERCASE, 10px square swatches.
- SVG: `min-width: 1100–1180px`, viewBox proportional. Lanes stacked vertically; phase bands alternate `--g100` / transparent for column zebra. Dashed phase divider lines `--g300`.
- Lane labels: rotated-feeling mono caps at far left (`x=6`, y centered per lane band).
- Nodes: 150×62px rounded-3px rects, white fill, 1px stroke colored by lane (`--slate` AG-equivalent, `--clay` PPI-equivalent, `--olive` shared/client-facing dashed). 2 title lines + 1 sub (mono, `--g500`).
- Edges: solid `--g500` for happy path, dashed `--rose` for failure/escalate, dotted `--olive` for cross-lane shared artifact. Arrow markers in `<defs>`.
- Blast-radius overlay: 5px `--rose` circle at node corner + mono caps label.

## Exemplar fragment

```html
<div class="flow-wrap">
  <div class="flow-legend">
    <span class="lg"><span class="swatch" style="background:var(--slate)"></span>Lane A</span>
    <span class="lg"><span class="swatch" style="background:var(--clay)"></span>Lane B</span>
    <span class="lg"><span class="swatch" style="background:var(--olive)"></span>Shared / client-facing</span>
    <span class="lg"><span class="swatch" style="background:var(--rose)"></span>Failure · escalate</span>
    <span class="lg"><span class="swatch" style="background:var(--rose);border-radius:50%"></span>Highest blast radius</span>
  </div>

  <svg class="flow" viewBox="0 0 1180 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Process flow">
    <defs>
      <marker id="arrow"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--g500)"/>
      </marker>
      <marker id="arrowR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--rose)"/>
      </marker>
    </defs>

    <!-- Phase bands (zebra) -->
    <rect class="phase-band" x="0"    y="40" width="170" height="450"/>
    <rect class="phase-band" x="340"  y="40" width="170" height="450"/>
    <rect class="phase-band" x="680"  y="40" width="170" height="450"/>
    <rect class="phase-band" x="1020" y="40" width="160" height="450"/>

    <!-- Phase labels -->
    <text class="phase-label" x="10"   y="22">PHASE 1</text>
    <text class="phase-foot"  x="10"   y="34">(T-1)</text>
    <!-- … more phase labels … -->

    <!-- Phase dividers -->
    <line class="phase-band-line" x1="170" y1="40" x2="170" y2="490"/>
    <!-- … -->

    <!-- Lane labels + separator -->
    <text class="lane-label" x="6" y="115">LANE A</text>
    <text class="lane-label" x="6" y="335">LANE B</text>
    <line x1="0" y1="240" x2="1180" y2="240" stroke="var(--g300)" stroke-width="1"/>

    <!-- Node -->
    <g class="node a" transform="translate(15,80)">
      <rect class="box" width="150" height="62" rx="3"/>
      <text class="title" x="9" y="20">Title line 1</text>
      <text class="title" x="9" y="34">Title line 2</text>
      <text class="sub"   x="9" y="50">sub · meta</text>
    </g>

    <!-- Happy edge -->
    <path class="edge"        d="M165 111 L185 111" marker-end="url(#arrow)"/>
    <!-- Failure escalation -->
    <path class="edge dashed" d="M1102 142 L1102 200 L900 200" marker-end="url(#arrowR)"/>
    <text class="edge-label" x="920" y="195">no ack 7d → escalate</text>

    <!-- Blast radius overlay -->
    <circle class="blast-dot" cx="660" cy="78" r="5"/>
    <text class="blast-label" x="585" y="72">highest blast</text>
  </svg>
</div>
```

## CSS

```css
.flow-wrap {
  background: var(--paper); border: 1px solid var(--g300); border-radius: 6px;
  padding: 18px; overflow-x: auto;
}
.flow-legend {
  display: flex; gap: 18px; flex-wrap: wrap; margin-bottom: 14px;
  font-family: var(--mono); font-size: 10.5px; color: var(--g500);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.flow-legend .lg { display: inline-flex; align-items: center; gap: 6px; }
.flow-legend .swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }

svg.flow { display: block; min-width: 1180px; height: auto; font-family: var(--sans); }
svg.flow .lane-label,
svg.flow .phase-label,
svg.flow .phase-foot,
svg.flow .edge-label,
svg.flow .blast-label {
  font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.06em;
}
svg.flow .lane-label  { font-size: 9.5px; fill: var(--g500); }
svg.flow .phase-label { font-size: 9px; fill: var(--clay); font-weight: 700; }
svg.flow .phase-foot  { font-size: 8px; fill: var(--g500); text-transform: none; }
svg.flow .node text.title { font-size: 11px; font-weight: 600; fill: var(--slate); font-family: var(--sans); text-transform: none; letter-spacing: 0; }
svg.flow .node text.sub   { font-size: 9.5px; fill: var(--g700); font-family: var(--mono); text-transform: none; letter-spacing: 0; }
svg.flow .node rect.box        { fill: var(--paper); stroke: var(--g300); stroke-width: 1; }
svg.flow .node.a rect.box      { stroke: var(--slate); }
svg.flow .node.b rect.box      { stroke: var(--clay); }
svg.flow .node.shared rect.box { stroke: var(--olive); stroke-dasharray: 3 2; }
svg.flow .edge        { stroke: var(--g500); stroke-width: 1; fill: none; }
svg.flow .edge.dashed { stroke-dasharray: 4 3; stroke: var(--rose); }
svg.flow .edge-label  { font-size: 8.5px; fill: var(--g500); }
svg.flow .phase-band      { fill: var(--g100); }
svg.flow .phase-band-line { stroke: var(--g300); stroke-width: 1; stroke-dasharray: 2 3; }
svg.flow .blast-dot   { fill: var(--rose); opacity: 0.85; }
svg.flow .blast-label { font-size: 8.5px; fill: var(--rose); font-weight: 700; }
```

## Pairs well with

- `archetypes/annotated-flowchart` — natural host; swimlane-flow is its multi-actor flavor.
- `archetypes/incident-timeline` — when the timeline has parallel responder lanes (oncall vs SRE vs comms).
- `archetypes/module-map` — when the map needs to show data flowing through ownership boundaries.
- `archetypes/explainer` — when explaining a process whose splits across roles are the *point*.
- `patterns/decision-box.md` — pair at end if the swimlane drives a verdict.

## Ancestry

Promoted 2026-05-14 by KN. Source artifact: an internal exploration doc (lifecycle flow). User feedback: wants reusable for example-insights synthesis (intervention loop swimlane: baseline → side-effect → checkpoint → delta, lane split = analyst-driven vs side-effect-driven) plus future ops journeys. Original color tokens (`--peru`, `--leaf`, `--slate-dark`) rewritten to Anthropic palette (`--clay`, `--olive`, `--slate`).
