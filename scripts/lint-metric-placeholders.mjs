import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import matter from "gray-matter";

import { findMetricPlaceholderViolations } from "../src/lib/metric-placeholders.mjs";

const caseStudyDir = path.join(process.cwd(), "src", "content", "case-studies");

const readMdxFiles = (dir) => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return readMdxFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".mdx") ? [entryPath] : [];
  });
};

const entries = readMdxFiles(caseStudyDir).map((filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  const parsed = matter(file);

  return {
    filePath: path.relative(process.cwd(), filePath),
    data: parsed.data,
  };
});

const violations = findMetricPlaceholderViolations(entries);

if (violations.length > 0) {
  console.error("Metric placeholder lint failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(
  `Metric placeholder lint passed for ${entries.length} case study file(s).`,
);
