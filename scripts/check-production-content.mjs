import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const distDir = path.join(process.cwd(), "dist");
const forbidden = [/TODO-COPY/i, /TODO-METRIC/i, /lorem ipsum/i];
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".svg",
  ".txt",
  ".xml",
]);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });

if (!fs.existsSync(distDir)) {
  console.error(
    "Production content check failed: dist/ does not exist. Run npm run build first.",
  );
  process.exit(1);
}

const violations = [];

for (const file of walk(distDir)) {
  if (!textExtensions.has(path.extname(file))) {
    continue;
  }

  const contents = fs.readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(contents)) {
      violations.push(
        `${path.relative(process.cwd(), file)} contains ${pattern}`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("Production content check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(
  "Production content check passed: no TODO-COPY, TODO-METRIC, or lorem ipsum strings found in text assets. #TODO-LINK and deck decision markers are tracked by report:content-markers.",
);
