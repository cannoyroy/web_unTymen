import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "..");

const STATUS_COLOR_ALLOWLIST = new Set([
  "#ff5f57",
  "#febc2e",
  "#28c840",
  "#f16d75",
  "#f3cf5a",
  "#07c160",
]);

const FILE_ALLOWLIST = [
  "src/styles/global.css",
  "src/pages/about.astro",
  "src/pages/experience.astro",
];

const PATH_EXCLUDES = [
  "src/components/about-page/",
  "src/components/experience-page/",
  "src/blog/",
  "src/components/shared/terminal/",
  "src/components/shared/dock/",
  "src/components/shared/dynamic-island/",
  "src/data/moments.ts",
];

const COLOR_REGEX = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)/g;

function listFilesRecursive(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursive(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

const srcRoot = join(repoRoot, "src");
const files = listFilesRecursive(srcRoot).map((p) =>
  relative(repoRoot, p).replace(/\\/g, "/"),
);
const violations = [];

for (const file of files) {
  const normalized = file.replace(/\\/g, "/");
  if (FILE_ALLOWLIST.includes(normalized)) continue;
  if (PATH_EXCLUDES.some((prefix) => normalized.startsWith(prefix))) continue;

  const content = readFileSync(join(repoRoot, normalized), "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    const matches = line.match(COLOR_REGEX);
    if (!matches) return;
    matches.forEach((match) => {
      const token = match.toLowerCase();
      if (STATUS_COLOR_ALLOWLIST.has(token)) return;
      violations.push({
        file: normalized,
        line: idx + 1,
        value: match,
      });
    });
  });
}

if (violations.length > 0) {
  console.error("Found hardcoded colors outside allowlist:");
  violations.forEach((v) => {
    console.error(`- ${relative(repoRoot, join(repoRoot, v.file)).replace(/\\/g, "/")}:${v.line} -> ${v.value}`);
  });
  process.exit(1);
}

console.log("check:colors passed");
