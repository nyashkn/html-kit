#!/usr/bin/env bun
// Build the archetype cheatsheet table in SKILL.md by scanning archetypes/*/recipe.md
// and extracting name + when from frontmatter.
//
// Usage:
//   bun scripts/build-cheatsheet.ts [--check]
//
// --check: don't write, exit 1 if files would change (for CI)
// All status output goes to stderr; successful runs exit 0.

import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "fs";
import { join, dirname } from "path";

const REPO_ROOT = dirname(import.meta.dir);
const ARCHETYPES_DIR = join(REPO_ROOT, "archetypes");
const SKILL_MD = join(REPO_ROOT, "skills", "html-kit", "SKILL.md");
const README_MD = join(REPO_ROOT, "README.md");

const CHEATSHEET_START = "<!-- cheatsheet:start -->";
const CHEATSHEET_END = "<!-- cheatsheet:end -->";

type Archetype = {
  name: string;
  when: string;
};

// Parse YAML-style frontmatter from recipe.md. No lib — just regex.
function parseFrontmatter(content: string): Partial<Archetype> {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  if (!match) return {};

  const front = match[1];
  const nameMatch = front.match(/^name:\s*(.+?)$/m);
  const whenMatch = front.match(/^when:\s*(.+?)$/m);

  return {
    name: nameMatch ? nameMatch[1].trim() : undefined,
    when: whenMatch ? whenMatch[1].trim() : undefined,
  };
}

// Read all archetypes, sorted by dir name, extract frontmatter.
function loadArchetypes(): Archetype[] {
  if (!existsSync(ARCHETYPES_DIR)) {
    process.stderr.write(`[build-cheatsheet] archetypes dir not found: ${ARCHETYPES_DIR}\n`);
    process.exit(1);
  }

  const dirs = readdirSync(ARCHETYPES_DIR)
    .filter(d => existsSync(join(ARCHETYPES_DIR, d, "recipe.md")))
    .sort();

  const archetypes: Archetype[] = [];
  for (const dir of dirs) {
    const recipeFile = join(ARCHETYPES_DIR, dir, "recipe.md");
    const content = readFileSync(recipeFile, "utf8");
    const fm = parseFrontmatter(content);

    if (!fm.when) {
      process.stderr.write(`[build-cheatsheet] missing when: in ${recipeFile}\n`);
      process.exit(1);
    }

    archetypes.push({
      name: fm.name || dir,
      when: fm.when,
    });
  }

  return archetypes;
}

// Extract the header row from the current cheatsheet (if it exists).
function getHeaderRow(skillContent: string): string {
  const startIdx = skillContent.indexOf(CHEATSHEET_START);
  const endIdx = skillContent.indexOf(CHEATSHEET_END);

  if (startIdx === -1 || endIdx === -1) {
    // Default header if not found
    return "| User wants… | Likely archetype |";
  }

  const cheatsheetBlock = skillContent.slice(startIdx, endIdx);
  const lines = cheatsheetBlock.split("\n");

  // Find the first line that looks like a header (starts with |)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("|") && i + 1 < lines.length && lines[i + 1].includes("---")) {
      return lines[i];
    }
  }

  return "| User wants… | Likely archetype |";
}

// Generate new cheatsheet content.
function generateCheatsheet(archetypes: Archetype[], headerRow: string): string {
  const lines = [
    CHEATSHEET_START,
    headerRow,
    "|---|---|",
  ];

  for (const arch of archetypes) {
    // Escape backticks in archetype names (unlikely but safe)
    const nameEscaped = arch.name.replace(/`/g, "\\`");
    lines.push(`| ${arch.when.replace(/^use when /i, "")} | \`${nameEscaped}\` |`);
  }

  lines.push(CHEATSHEET_END);
  return lines.join("\n");
}

// Replace content between markers in a file.
function updateMarkedSection(
  content: string,
  startMarker: string,
  endMarker: string,
  newContent: string,
): string {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Could not find markers in file`);
  }

  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx + endMarker.length);
  return before + newContent + after;
}

// Update archetype count in README.md — every occurrence, not just the first
// (README has multiple "<N> archetypes" / "<N> battle-tested archetypes" spots).
function updateArchetypeCount(content: string, count: number): string {
  const regex = /\b\d+\s+(?:battle-tested\s+)?archetypes\b/g;
  return content.replace(regex, `${count} battle-tested archetypes`);
}

async function main() {
  const checkMode = process.argv.includes("--check");

  try {
    // Load all archetypes
    const archetypes = loadArchetypes();
    const count = archetypes.length;

    if (archetypes.length === 0) {
      process.stderr.write(`[build-cheatsheet] no archetypes found\n`);
      process.exit(1);
    }

    // Read current files
    const skillContent = readFileSync(SKILL_MD, "utf8");
    const readmeContent = readFileSync(README_MD, "utf8");

    // Generate new content
    const headerRow = getHeaderRow(skillContent);
    const newCheatsheet = generateCheatsheet(archetypes, headerRow);
    const newSkillContent = updateMarkedSection(
      skillContent,
      CHEATSHEET_START,
      CHEATSHEET_END,
      newCheatsheet,
    );
    const newReadmeContent = updateArchetypeCount(readmeContent, count);

    // Check mode: exit non-zero if changes would be made
    if (checkMode) {
      const skillChanged = newSkillContent !== skillContent;
      const readmeChanged = newReadmeContent !== readmeContent;

      if (skillChanged || readmeChanged) {
        process.stderr.write(
          `[build-cheatsheet] --check: files would change\n`,
        );
        if (skillChanged) process.stderr.write(`  skills/html-kit/SKILL.md\n`);
        if (readmeChanged) process.stderr.write(`  README.md\n`);
        process.exit(1);
      }

      process.stderr.write(`[build-cheatsheet] --check: files are up to date\n`);
      process.exit(0);
    }

    // Write new files
    writeFileSync(SKILL_MD, newSkillContent);
    writeFileSync(README_MD, newReadmeContent);

    process.stderr.write(
      `[build-cheatsheet] updated ${count} archetypes\n` +
      `  skills/html-kit/SKILL.md\n` +
      `  README.md\n`,
    );

    process.exit(0);
  } catch (e) {
    process.stderr.write(`[build-cheatsheet] error: ${String(e)}\n`);
    process.exit(1);
  }
}

main();
