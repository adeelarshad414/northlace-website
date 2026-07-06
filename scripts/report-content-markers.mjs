import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const scanTargets = [
  ".env.example",
  "DUMMY-VALUES.md",
  "README.md",
  "docs",
  "functions",
  "src",
];
const ignoredDirs = new Set([
  ".astro",
  ".git",
  ".lighthouseci",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const markers = [
  "TODO-COPY",
  "TODO-METRIC",
  "#TODO-LINK",
  "HUMAN_DECISION_GATE",
  "PHASE_2_HOOK",
  "CHANGE_ME_DEV_ONLY",
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") && entry.name !== ".github") {
      return [];
    }

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return ignoredDirs.has(entry.name) ? [] : walk(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });

const rows = [];

const files = scanTargets.flatMap((target) => {
  const targetPath = path.join(root, target);
  if (!fs.existsSync(targetPath)) return [];
  const stats = fs.statSync(targetPath);
  return stats.isDirectory() ? walk(targetPath) : [targetPath];
});

for (const filePath of files) {
  const relativePath = path.relative(root, filePath);
  const contents = fs.readFileSync(filePath, "utf8");

  contents.split("\n").forEach((line, index) => {
    for (const marker of markers) {
      if (line.includes(marker)) {
        rows.push({
          line: index + 1,
          marker,
          path: relativePath,
        });
      }
    }
  });
}

if (rows.length === 0) {
  console.log("Content marker report: no tracked markers found.");
  process.exit(0);
}

console.log("Content marker report:");
for (const row of rows) {
  console.log(`- ${row.path}:${row.line} ${row.marker}`);
}

console.log(
  `Found ${rows.length} tracked marker occurrence(s). This report is informational and does not fail CI.`,
);
