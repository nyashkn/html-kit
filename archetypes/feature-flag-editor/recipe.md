# feature-flag-editor

**Use when:** editing a feature-flag config interactively — toggles grouped by area, dependency warnings, copy-diff export.

**Data shape:** flag list (key, current value, area, depends-on), grouping by area, dependency edges between flags.

**Gotchas:**
- Show a warning chip when a flag's prerequisite is off — silent broken state is the failure mode.
- "Copy diff" must emit ONLY the changed keys, not the whole config.
- Group toggles by area; flat lists of 30 flags are unscannable.
