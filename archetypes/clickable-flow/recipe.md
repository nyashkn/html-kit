# clickable-flow

**Use when:** prototyping a multi-screen interaction — N screens linked together so the user can feel the flow.

**Data shape:** ordered list of screens (each a small mockup), hotspot regions per screen mapping to next-screen target.

**Gotchas:**
- Keep fidelity low-medium; high-fi distracts from the interaction question.
- Single page, JS-swap visible screen — don't navigate to separate files.
- Add a "back to start" affordance so testers don't reload to retry.
