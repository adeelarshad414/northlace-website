import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const scanRoots = ["src/components", "src/pages/brand", "src/layouts"];
const rawHexPattern = /#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g;

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return entry.isFile() ? [entryPath] : [];
  });

describe("brand token compliance", () => {
  it("keeps component chrome free of raw hex literals", () => {
    const offenders = scanRoots.flatMap((scanRoot) =>
      walk(path.join(root, scanRoot)).flatMap((filePath) => {
        const contents = fs.readFileSync(filePath, "utf8");
        const matches = contents.match(rawHexPattern) ?? [];
        return matches.map(
          (match) => `${path.relative(root, filePath)} contains ${match}`,
        );
      }),
    );

    expect(offenders).toEqual([]);
  });
});
