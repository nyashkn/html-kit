#!/usr/bin/env bash
set -euo pipefail

# Scaffold runs in the empty workspace (cwd), unsandboxed, before Claude
# starts. Content is embedded via heredoc rather than copied from
# fixtures/ — the docs don't guarantee the script's cwd or invocation
# preserves a path back to the case directory, so heredoc is the only
# form guaranteed to work regardless of how --scaffold invokes this file.
cat > artifact.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>02_v0.4.0-interaction-loop</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #2b2b28; }
  [data-component="header"] { font-size: 1.4rem; font-weight: 600; }
</style>
</head>
<body>
  <div data-component="header">v0.4.0 interaction loop — fixture artifact for evals</div>
  <p>Placeholder render used only to give the drain eval case something to annotate against.</p>
</body>
</html>
EOF

cat > artifact.html.annotations.jsonl <<'EOF'
{"id":"a1","item_id":"lane-2-agent","type":"reject","value":"too many phases, collapse to 3","at":"2026-09-15T10:02:00Z"}
{"id":"a2","item_id":"option-card-pagefind","type":"accept","value":null,"at":"2026-09-15T10:04:00Z"}
EOF
