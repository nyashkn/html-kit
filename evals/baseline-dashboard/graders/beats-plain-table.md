---
type: llm
focus: last_message
---

PASS if the run produced a self-contained, visually structured dashboard
artifact (stat tiles, a chart or sparkline, or a styled table with clear
hierarchy) rather than an unstyled table of the raw rows.

FAIL if the output is plain markup with no layout, styling, or visual
hierarchy beyond a bare table.

The no-plugin arm (`--ablation with-without`) supplies the comparison.
