#!/usr/bin/env bun
// PostToolUse hook (Write|Edit): enforces render-audit.ts on html-kit rendered
// artifacts instead of relying on a prose instruction in SKILL.md (spec F10).
//
// PostToolUse can't block the tool call (it already ran) — exit 2 just shows
// stderr to Claude so it fixes and rewrites the file. Never throws: any
// failure here (bad stdin, missing file, spawn error) exits 0 silently so a
// broken hook can't wedge an unrelated Write/Edit.
//
// hooks.json invokes this file in "exec form" (command:"bun", args:[...]),
// which spawns `bun` directly with no shell — so there's no portable way to
// `command -v bun` first. If bun is absent, Claude Code's own hook runner
// fails to spawn it and reports a non-2 exit; that surfaces as harmless
// noise to Claude (not a blocking [FAIL]), which is acceptable here.

import { audit } from "./render-audit";

try {
  const input = JSON.parse(await Bun.stdin.text());
  const filePath: unknown = input?.tool_input?.file_path;

  if (typeof filePath !== "string") process.exit(0);
  if (!/\.html-kit\/.*\.html$/.test(filePath)) process.exit(0);
  if (/\.annotations\./.test(filePath)) process.exit(0);

  const content = await Bun.file(filePath).text();
  const { fails } = audit(content);

  if (fails.length > 0) {
    process.stderr.write(
      `html-kit render audit failed for ${filePath}:\n${fails.join("\n")}\nfix and rewrite the file.\n`,
    );
    process.exit(2);
  }

  process.exit(0);
} catch {
  process.exit(0);
}
