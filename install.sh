#!/usr/bin/env bash
# Install html-kit skill — symlinks source skill into ~/.agents/skills/
# then symlinks that into ~/.claude/skills/ for Claude Code discovery.
#
# Idempotent. Re-run after pulling repo updates (no-op if links already correct).
# Use `./install.sh --uninstall` to remove both symlinks.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="${REPO_ROOT}/skill/html-kit"
AGENTS_DIR="${HOME}/.agents/skills"
CLAUDE_DIR="${HOME}/.claude/skills"
AGENTS_LINK="${AGENTS_DIR}/html-kit"
CLAUDE_LINK="${CLAUDE_DIR}/html-kit"

if [[ "${1:-}" == "--uninstall" ]]; then
  echo "→ uninstalling html-kit symlinks"
  [[ -L "$CLAUDE_LINK" ]] && rm "$CLAUDE_LINK" && echo "  removed $CLAUDE_LINK"
  [[ -L "$AGENTS_LINK" ]] && rm "$AGENTS_LINK" && echo "  removed $AGENTS_LINK"
  echo "✓ uninstalled"
  exit 0
fi

if [[ ! -d "$SOURCE" ]]; then
  echo "✗ source skill missing: $SOURCE" >&2
  exit 1
fi
if [[ ! -f "$SOURCE/SKILL.md" ]]; then
  echo "✗ SKILL.md missing in source: $SOURCE/SKILL.md" >&2
  exit 1
fi

mkdir -p "$AGENTS_DIR" "$CLAUDE_DIR"

# Tier 1: ~/.agents/skills/html-kit → repo source
if [[ -L "$AGENTS_LINK" ]]; then
  current="$(readlink "$AGENTS_LINK")"
  if [[ "$current" == "$SOURCE" ]]; then
    echo "→ ~/.agents/skills/html-kit already → $SOURCE"
  else
    echo "→ updating ~/.agents/skills/html-kit (was: $current)"
    rm "$AGENTS_LINK"
    ln -s "$SOURCE" "$AGENTS_LINK"
  fi
elif [[ -e "$AGENTS_LINK" ]]; then
  echo "✗ ~/.agents/skills/html-kit exists but is not a symlink — refusing to overwrite" >&2
  exit 1
else
  ln -s "$SOURCE" "$AGENTS_LINK"
  echo "→ linked ~/.agents/skills/html-kit → $SOURCE"
fi

# Tier 2: ~/.claude/skills/html-kit → ~/.agents/skills/html-kit
if [[ -L "$CLAUDE_LINK" ]]; then
  current="$(readlink "$CLAUDE_LINK")"
  if [[ "$current" == "$AGENTS_LINK" ]]; then
    echo "→ ~/.claude/skills/html-kit already → $AGENTS_LINK"
  else
    echo "→ updating ~/.claude/skills/html-kit (was: $current)"
    rm "$CLAUDE_LINK"
    ln -s "$AGENTS_LINK" "$CLAUDE_LINK"
  fi
elif [[ -e "$CLAUDE_LINK" ]]; then
  echo "✗ ~/.claude/skills/html-kit exists but is not a symlink — refusing to overwrite" >&2
  exit 1
else
  ln -s "$AGENTS_LINK" "$CLAUDE_LINK"
  echo "→ linked ~/.claude/skills/html-kit → $AGENTS_LINK"
fi

echo
echo "✓ html-kit installed"
echo "  source : $SOURCE"
echo "  agents : $AGENTS_LINK → $(readlink "$AGENTS_LINK")"
echo "  claude : $CLAUDE_LINK → $(readlink "$CLAUDE_LINK")"
echo
echo "Restart Claude Code to pick up the skill, then invoke /html-kit"
