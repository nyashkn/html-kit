# Pattern: annotation-strip

Per-item structured feedback widget — accept/reject/comment/tag, posts to daemon or localStorage fallback.

## When to use

- KN is reviewing an artifact iteratively and wants to leave per-item signal without leaving the page
- Agent needs structured next-turn input (which tickets/cards were accepted, rejected, tagged) instead of free-form prose reply
- 10-session daemon mode (`html-kit serve` on port 63839) is active and round-trip annotations should flow back into the working dir as JSONL
- **Retroactive feedback on legacy artifacts**: daemon serves any pre-v0.4.0 render; auto-attach injects strips on common selectors w/o source edits.

## Spec

- Wrapper: `<div data-component="annotation-strip" data-item-id="<id>">` attached to any artifact item (ticket, card, section)
- Four inline controls: `✓` accept (sage tint on active), `✗` reject (rose tint on active), `💬` comment toggle (opens textarea below), `🏷` tag chips (clay/dust pickable, multi-select)
- Comment textarea: hidden by default; appears below strip when 💬 clicked; ~3 rows, `var(--paper)` bg, 1px `var(--gray-200)` border, 8px radius, `var(--mono-stack)` font
- Persists active state via `[data-state="active"]` on the button — sage/rose border tint sticks across re-renders (read from store on mount)
- Each interaction emits `{ts: ISO, item_id, action: 'accept'|'reject'|'comment'|'tag', value, agent_should_read: true}`
- Routing:
  - Daemon mode (`hostname==='localhost' && port==='63839'`) → POST `/api/annotate?path=<location.pathname>`
  - file:// or other → push to `localStorage['html-kit-annot:'+location.pathname]` JSON array
- "Copy annotations" button at top-right of artifact (only shown in file:// mode) → builds JSONL from localStorage → `navigator.clipboard.writeText`
- **Auto-attach mode**: when daemon-served, JS scans DOM on `DOMContentLoaded` for selectors matching `[data-component="ticket"]`, `[data-component="proposal-card"]`, `[data-component="row"]`, `[data-component="option-card"]`, `[data-annotatable]`. For each match w/o existing `[data-component="annotation-strip"]` sibling, generate stable `item_id` from `element.dataset.itemId || element.id || hash(element.textContent.slice(0,200))` and inject `<div data-component="annotation-strip" data-item-id="<id>">…</div>` as last child of matched element.

## Exemplar fragment

```html
<button class="annot-copy" data-component="annotation-copy">Copy annotations</button>

<article class="ticket" id="ticket-001">
  <h3>Ticket 001 — auth race condition</h3>
  <p>Reproduce by hammering /login from two tabs simultaneously…</p>
  <div data-component="annotation-strip" data-item-id="ticket-001">
    <button data-action="accept"  title="Accept">✓</button>
    <button data-action="reject"  title="Reject">✗</button>
    <button data-action="comment" title="Comment">💬</button>
    <span class="tag-chips">
      <button data-action="tag" data-value="blocker">blocker</button>
      <button data-action="tag" data-value="nit">nit</button>
      <button data-action="tag" data-value="defer">defer</button>
    </span>
    <textarea data-role="comment-field" placeholder="Leave a note for the agent…" hidden></textarea>
  </div>
</article>

<article class="ticket" id="ticket-002">
  <h3>Ticket 002 — retry budget</h3>
  <div data-component="annotation-strip" data-item-id="ticket-002">…</div>
</article>

<article class="ticket" id="ticket-003">
  <h3>Ticket 003 — circuit breaker</h3>
  <div data-component="annotation-strip" data-item-id="ticket-003">…</div>
</article>
```

## CSS

```css
[data-component="annotation-strip"] {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  margin-top: 10px; padding: 6px 8px;
  border-top: 1px dashed var(--gray-200);
  font-family: var(--mono-stack);
  font-size: 12px;
}
[data-component="annotation-strip"] button {
  background: var(--paper);
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  padding: 3px 8px;
  cursor: pointer;
  font: inherit;
  color: var(--g700);
  transition: background 0.12s, border-color 0.12s;
}
[data-component="annotation-strip"] button:hover {
  border-color: var(--clay);
  background: var(--g100);
}
[data-component="annotation-strip"] button[data-action="accept"][data-state="active"] {
  background: var(--sage); border-color: var(--sage); color: var(--paper);
}
[data-component="annotation-strip"] button[data-action="reject"][data-state="active"] {
  background: var(--rose); border-color: var(--rose); color: var(--paper);
}
[data-component="annotation-strip"] .tag-chips {
  display: inline-flex; gap: 4px; margin-left: 4px;
}
[data-component="annotation-strip"] .tag-chips button {
  font-size: 11px; padding: 2px 7px; color: var(--clay);
}
[data-component="annotation-strip"] .tag-chips button[data-state="active"] {
  background: var(--clay); color: var(--paper); border-color: var(--clay);
}
[data-component="annotation-strip"] textarea[data-role="comment-field"] {
  flex-basis: 100%;
  margin-top: 6px;
  min-height: 3em;
  padding: 8px 10px;
  background: var(--paper);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  font: 12px/1.4 var(--mono-stack);
  color: var(--g700);
  resize: vertical;
}
.annot-copy {
  position: fixed; top: 14px; right: 14px; z-index: 50;
  font: 11px var(--mono-stack); text-transform: uppercase; letter-spacing: 0.06em;
  background: var(--paper); border: 1px solid var(--clay); color: var(--clay);
  padding: 5px 10px; border-radius: 6px; cursor: pointer;
}
.annot-copy:hover { background: var(--clay); color: var(--paper); }
```

## JS

```js
// Auto-attach: inject annotation strips into existing markup when daemon-served.
function htmlKitAutoAttach() {
  const isDaemon = window.location.hostname === 'localhost' && window.location.port === '63839';
  if (!isDaemon) return; // file:// mode requires explicit wrapper authoring
  const SELECTORS = '[data-component="ticket"], [data-component="proposal-card"], [data-component="row"], [data-component="option-card"], [data-annotatable]';
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h.toString(36); };
  document.querySelectorAll(SELECTORS).forEach((el) => {
    if (el.querySelector(':scope > [data-component="annotation-strip"]')) return;
    const id = el.dataset.itemId || el.id || ('ann-' + hash((el.textContent || '').slice(0, 200)));
    const strip = document.createElement('div');
    strip.setAttribute('data-component', 'annotation-strip');
    strip.setAttribute('data-item-id', id);
    strip.innerHTML = `
      <button data-action="accept" aria-label="Accept">✓</button>
      <button data-action="reject" aria-label="Reject">✗</button>
      <button data-action="comment-toggle" aria-label="Comment">💬</button>
      <button data-action="tag-toggle" aria-label="Tag">🏷</button>
      <textarea data-role="comment" placeholder="comment…" hidden></textarea>
      <div data-role="tag-picker" hidden>
        <span data-tag="bug">bug</span><span data-tag="ux">ux</span>
        <span data-tag="copy">copy</span><span data-tag="defer">defer</span>
      </div>
    `;
    el.appendChild(strip);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', htmlKitAutoAttach);
} else {
  htmlKitAutoAttach();
}
```

```javascript
(function () {
  const isDaemon =
    window.location.hostname === "localhost" &&
    window.location.port === "63839";
  const storeKey = "html-kit-annot:" + window.location.pathname;

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(storeKey) || "[]"); }
    catch { return []; }
  }
  function saveStore(arr) {
    localStorage.setItem(storeKey, JSON.stringify(arr));
  }

  function emit(event) {
    if (isDaemon) {
      fetch("/api/annotate?path=" + encodeURIComponent(window.location.pathname), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch(() => { const a = loadStore(); a.push(event); saveStore(a); });
    } else {
      const a = loadStore(); a.push(event); saveStore(a);
    }
  }

  // Rehydrate active states from localStorage on mount
  const prior = loadStore();
  prior.forEach((e) => {
    const strip = document.querySelector(
      `[data-component="annotation-strip"][data-item-id="${e.item_id}"]`
    );
    if (!strip) return;
    if (e.action === "accept" || e.action === "reject") {
      strip.querySelectorAll('button[data-action="accept"],button[data-action="reject"]')
        .forEach((b) => b.removeAttribute("data-state"));
      strip.querySelector(`button[data-action="${e.action}"]`)?.setAttribute("data-state", "active");
    }
    if (e.action === "tag") {
      strip.querySelector(`button[data-action="tag"][data-value="${e.value}"]`)
        ?.setAttribute("data-state", "active");
    }
  });

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-component='annotation-strip'] button");
    if (!btn) return;
    const strip = btn.closest("[data-component='annotation-strip']");
    const itemId = strip.dataset.itemId;
    const action = btn.dataset.action;

    if (action === "comment") {
      const ta = strip.querySelector("textarea[data-role='comment-field']");
      ta.hidden = !ta.hidden;
      if (!ta.hidden) ta.focus();
      return;
    }
    if (action === "accept" || action === "reject") {
      strip.querySelectorAll("button[data-action='accept'],button[data-action='reject']")
        .forEach((b) => b.removeAttribute("data-state"));
      btn.setAttribute("data-state", "active");
    }
    if (action === "tag") {
      btn.toggleAttribute("data-state");
      if (btn.hasAttribute("data-state")) btn.setAttribute("data-state", "active");
    }
    emit({
      ts: new Date().toISOString(),
      item_id: itemId,
      action,
      value: action === "tag" ? btn.dataset.value : undefined,
      agent_should_read: true,
    });
  });

  document.addEventListener("change", (ev) => {
    const ta = ev.target.closest("textarea[data-role='comment-field']");
    if (!ta) return;
    const strip = ta.closest("[data-component='annotation-strip']");
    emit({
      ts: new Date().toISOString(),
      item_id: strip.dataset.itemId,
      action: "comment",
      value: ta.value,
      agent_should_read: true,
    });
  });

  // file:// mode: expose copy button
  if (!isDaemon) {
    const copyBtn = document.querySelector("[data-component='annotation-copy']");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const jsonl = loadStore().map((e) => JSON.stringify(e)).join("\n");
        navigator.clipboard.writeText(jsonl);
        copyBtn.textContent = "Copied ✓";
        setTimeout(() => (copyBtn.textContent = "Copy annotations"), 1200);
      });
    }
  } else {
    document.querySelector("[data-component='annotation-copy']")?.remove();
  }
})();
```

## Pairs well with

- `archetypes/triage-board` — natural host; each ticket card gets its own strip so KN sweeps the board accept/reject in one pass.
- `archetypes/plan-card-stack` — annotate which planned cards make the next cut.
- `archetypes/explainer` — section-level strips for "this paragraph lands / doesn't land" feedback on draft writeups.
- `patterns/swimlane-flow.md` — pair when the artifact already shows the human↔agent feedback loop as a swimlane diagram and per-node strips drop the reader straight into the loop.
- `patterns/decision-box.md` — strip lives on per-item rows; decision-box still closes the artifact with the rolled-up verdict.

## Ancestry

Created 2026-05-19 for v0.4.0 to close the human↔agent iteration gap. Inspired by `obra/superpowers` `brainstorming/visual-companion.md` JSONL-event capture, adapted to file:// + daemon dual-mode so the same artifact works whether KN double-clicks it from Finder or opens it through `html-kit serve`. KN flagged the gap directly: "feedback when having a back and forth with the agent and am annotating" — see `.html-kit/02_v0.4.0-interaction-loop.html` for the loop diagram driving v0.4.0.

- 2026-05-19 update: added auto-attach so daemon-served artifacts (incl. legacy renders predating this pattern) gain strips without edits. KN choice: auto-attach over per-render wrapper authoring — see .html-kit/02_v0.4.0-interaction-loop.html phase 4.
