import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const forbiddenDir = join(repoRoot, "src", "test");

function listTests(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const next = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTests(next));
      continue;
    }

    if (/\.test\.(ts|tsx)$/.test(entry.name)) {
      files.push(next);
    }
  }

  return files;
}

try {
  const found = listTests(forbiddenDir);
  if (found.length > 0) {
    console.error("Found tests under forbidden directory src/test:");
    for (const file of found) {
      console.error(`- ${relative(repoRoot, file).replace(/\\/g, "/")}`);
    }
    process.exit(1);
  }
} catch {
  // src/test directory does not exist; this is expected.
}

console.log("check:test-layout passed");
