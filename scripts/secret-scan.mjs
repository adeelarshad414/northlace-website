import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignoredDirs = new Set([
  ".astro",
  ".git",
  ".lighthouseci",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const ignoredFiles = new Set(["package-lock.json"]);
const patterns = [
  {
    name: "private key",
    regex: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/,
  },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9_]{36,}/ },
  { name: "Slack token", regex: /xox[baprs]-[A-Za-z0-9-]{20,}/ },
  { name: "Stripe live key", regex: /sk_live_[A-Za-z0-9]{16,}/ },
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirs.has(entry.name)) {
      return [];
    }

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    if (!entry.isFile() || ignoredFiles.has(entry.name)) {
      return [];
    }

    return [entryPath];
  });

const violations = [];

for (const file of walk(root)) {
  const contents = fs.readFileSync(file);
  if (contents.includes(0)) {
    continue;
  }

  const text = contents.toString("utf8");
  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      violations.push(`${path.relative(root, file)} matched ${pattern.name}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Secret scan failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Secret scan passed.");
