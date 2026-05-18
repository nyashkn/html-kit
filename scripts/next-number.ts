#!/usr/bin/env bun
// Returns the next available 2-digit NN prefix for files in a directory.
// 00 is reserved exclusively for "00_backlog.html"; minimum returned value is "01".

import { readdirSync, existsSync } from "fs";

const dir = process.argv[2];
if (!dir) {
  process.stderr.write("Usage: bun scripts/next-number.ts <dir>\n");
  process.exit(1);
}

if (!existsSync(dir)) {
  process.stdout.write("01\n");
  process.exit(0);
}

const files = readdirSync(dir);
const nums: number[] = [];

for (const f of files) {
  const m = f.match(/^(\d{2})_/);
  if (!m) continue;
  const n = parseInt(m[1], 10);
  // 00 is reserved for backlog only — skip it in the max calculation
  if (n === 0) continue;
  nums.push(n);
}

const max = nums.length > 0 ? Math.max(...nums) : 0;
const next = Math.max(max + 1, 1);
process.stdout.write(String(next).padStart(2, "0") + "\n");
