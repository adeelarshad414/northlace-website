import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { brands } from "../../src/data/brands";

interface ManifestFile {
  bytes: number;
  mime: string;
  path: string;
  sha256: string;
}

interface BrandManifest {
  brands: Record<string, { files: ManifestFile[] }>;
}

const publicDir = path.join(process.cwd(), "public");
const manifestPath = path.join(publicDir, "brand", "manifest.json");
const manifest = JSON.parse(
  fs.readFileSync(manifestPath, "utf8"),
) as BrandManifest;

const expectedFiles = (slug: string) => [
  `/brand/${slug}/${slug}-icon-transparent.svg`,
  `/brand/${slug}/${slug}-mark-dark.svg`,
  `/brand/${slug}/${slug}-mark-light.svg`,
  `/brand/${slug}/${slug}-lockup-horizontal-dark.svg`,
  `/brand/${slug}/${slug}-lockup-horizontal-light.svg`,
  `/brand/${slug}/${slug}-brand-guidelines.pdf`,
  `/brand/${slug}/${slug}-deck-template.pptx`,
  `/brand/${slug}/${slug}-og.png`,
];

const expectedMime = (filePath: string) => {
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".pdf")) return "application/pdf";
  if (filePath.endsWith(".pptx")) {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  if (filePath.endsWith(".png")) return "image/png";
  throw new Error(`Unexpected extension: ${filePath}`);
};

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return entry.isFile() ? [entryPath] : [];
  });

describe("brand manifest", () => {
  it("lists 32 kit files plus the manifest file under public/brand", () => {
    expect(Object.keys(manifest.brands).sort()).toEqual(
      brands.map((brand) => brand.slug).sort(),
    );
    expect(
      Object.values(manifest.brands).flatMap((brand) => brand.files),
    ).toHaveLength(32);
    expect(walk(path.join(publicDir, "brand"))).toHaveLength(33);
  });

  it("matches every generated file's path, byte size, MIME type, and sha256", () => {
    for (const brand of brands) {
      const files = manifest.brands[brand.slug]?.files ?? [];
      expect(files.map((file) => file.path)).toEqual(expectedFiles(brand.slug));

      for (const file of files) {
        const diskPath = path.join(publicDir, file.path.replace(/^\//, ""));
        const buffer = fs.readFileSync(diskPath);

        expect(file.bytes, file.path).toBe(buffer.length);
        expect(file.mime, file.path).toBe(expectedMime(file.path));
        expect(file.sha256, file.path).toBe(
          crypto.createHash("sha256").update(buffer).digest("hex"),
        );
      }
    }
  });
});
