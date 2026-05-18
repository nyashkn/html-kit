#!/usr/bin/env bash
# Install html-kit skill — symlinks source skill into ~/.agents/skills/
# then symlinks that into ~/.claude/skills/ for Claude Code discovery.
#
# Idempotent. Re-run after pulling repo updates (no-op if links already correct).
# Use `./install.sh --uninstall` to remove both symlinks.

set -euo pipefail

# Preflight: bun is required for html-kit helper scripts
command -v bun >/dev/null 2>&1 || { echo "html-kit requires bun. Install: curl -fsSL https://bun.sh/install | bash"; exit 1; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTS_DIR="${HOME}/.agents/skills"
CLAUDE_DIR="${HOME}/.claude/skills"

# All skills under skill/ get installed. Add new sub-skills by dropping a
# directory under skill/ and re-running ./install.sh — no edits needed here.
SKILLS=()
for dir in "${REPO_ROOT}"/skill/*/; do
  [[ -d "$dir" && -f "$dir/SKILL.md" ]] && SKILLS+=("$(basename "$dir")")
done

if [[ "${1:-}" == "--uninstall" ]]; then
  echo "→ uninstalling html-kit symlinks"
  for name in "${SKILLS[@]}"; do
    [[ -L "${CLAUDE_DIR}/${name}" ]] && rm "${CLAUDE_DIR}/${name}" && echo "  removed ${CLAUDE_DIR}/${name}"
    [[ -L "${AGENTS_DIR}/${name}" ]] && rm "${AGENTS_DIR}/${name}" && echo "  removed ${AGENTS_DIR}/${name}"
  done
  echo "✓ uninstalled"
  exit 0
fi

if [[ ${#SKILLS[@]} -eq 0 ]]; then
  echo "✗ no skills found under ${REPO_ROOT}/skill/" >&2
  exit 1
fi

mkdir -p "$AGENTS_DIR" "$CLAUDE_DIR"

link_skill() {
  local name="$1"
  local source="${REPO_ROOT}/skill/${name}"
  local agents_link="${AGENTS_DIR}/${name}"
  local claude_link="${CLAUDE_DIR}/${name}"

  # Tier 1: ~/.agents/skills/<name> → repo source
  if [[ -L "$agents_link" ]]; then
    local current; current="$(readlink "$agents_link")"
    if [[ "$current" == "$source" ]]; then
      echo "  ~/.agents/skills/${name} already → $source"
    else
      echo "  updating ~/.agents/skills/${name} (was: $current)"
      rm "$agents_link"
      ln -s "$source" "$agents_link"
    fi
  elif [[ -e "$agents_link" ]]; then
    echo "✗ ~/.agents/skills/${name} exists but is not a symlink — refusing to overwrite" >&2
    return 1
  else
    ln -s "$source" "$agents_link"
    echo "  linked ~/.agents/skills/${name} → $source"
  fi

  # Tier 2: ~/.claude/skills/<name> → ~/.agents/skills/<name>
  if [[ -L "$claude_link" ]]; then
    local current; current="$(readlink "$claude_link")"
    if [[ "$current" == "$agents_link" ]]; then
      echo "  ~/.claude/skills/${name} already → $agents_link"
    else
      echo "  updating ~/.claude/skills/${name} (was: $current)"
      rm "$claude_link"
      ln -s "$agents_link" "$claude_link"
    fi
  elif [[ -e "$claude_link" ]]; then
    echo "✗ ~/.claude/skills/${name} exists but is not a symlink — refusing to overwrite" >&2
    return 1
  else
    ln -s "$agents_link" "$claude_link"
    echo "  linked ~/.claude/skills/${name} → $agents_link"
  fi
}

for name in "${SKILLS[@]}"; do
  echo "→ ${name}"
  link_skill "$name"
done

echo
echo "✓ html-kit installed (${#SKILLS[@]} skill(s): ${SKILLS[*]})"
echo
echo "Restart Claude Code to pick up the skills, then invoke /html-kit or /html-kit:add-to-patterns"
