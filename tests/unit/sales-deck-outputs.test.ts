import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import JSZip from "jszip";
import { describe, expect, it } from "vitest";

interface ManifestFile {
  bytes: number;
  mime: string;
  path: string;
  sha256: string;
}

interface BrandManifest {
  brands: Record<string, { files: ManifestFile[] }>;
}

const root = process.cwd();
const publicDir = path.join(root, "public");
const manifest = JSON.parse(
  fs.readFileSync(path.join(publicDir, "brand", "manifest.json"), "utf8"),
) as BrandManifest;
const salesDeckPaths = [
  "/brand/northlace/northlace-modernization-sales-deck.pptx",
  "/brand/northlace/northlace-modernization-sales-deck.pdf",
];
const sourcePdf = path.join(
  root,
  "assets",
  "source",
  "application-modernization-cloud-devops-sales-deck.pdf",
);

const readPublicFile = (publicPath: string) =>
  fs.readFileSync(path.join(publicDir, publicPath.replace(/^\//, "")));

const extractPptxText = async (publicPath: string) => {
  const zip = await JSZip.loadAsync(readPublicFile(publicPath));
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort(
      (a, b) =>
        Number(a.match(/slide(\d+)\.xml/)?.[1] ?? 0) -
        Number(b.match(/slide(\d+)\.xml/)?.[1] ?? 0),
    );
  const text = (
    await Promise.all(
      slideFiles.map(async (fileName) => {
        const xml = await zip.file(fileName)?.async("string");
        return xml ?? "";
      }),
    )
  )
    .join("\n")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

  return { slideFiles, text };
};

describe("sales deck outputs", () => {
  it("keeps the source PDF committed for provenance", () => {
    const stats = fs.statSync(sourcePdf);

    expect(stats.size).toBeGreaterThan(1_000_000);
  });

  it("lists generated PPTX and PDF in the brand manifest with matching hashes", () => {
    const records = manifest.brands.northlace.files.filter((file) =>
      salesDeckPaths.includes(file.path),
    );

    expect(records.map((record) => record.path)).toEqual(salesDeckPaths);

    for (const record of records) {
      const buffer = readPublicFile(record.path);
      expect(record.bytes, record.path).toBe(buffer.length);
      expect(record.sha256, record.path).toBe(
        crypto.createHash("sha256").update(buffer).digest("hex"),
      );
    }
  });

  it("contains the offer framework and avoids source theme colors", async () => {
    const { slideFiles, text } = await extractPptxText(salesDeckPaths[0]);
    const bannedSourceColors = [
      "4285F4",
      "34A853",
      "FBBC05",
      "EA4335",
      "FF6D00",
      "8E24AA",
      "1A73E8",
    ];

    expect(slideFiles).toHaveLength(16);
    for (const required of [
      "Specific Person",
      "Specific Problem",
      "Specific Way",
      "TODO-COPY: tighten ICP",
      "TODO-OFFER: confirm guarantee terms",
      "HUMAN_DECISION_GATE",
      "TODO-PRICE: confirm pricing and scope bands",
      "TODO-METRIC: attach client-approved evidence before external distribution",
      "quick wins found in the assessment routinely fund the pilot",
      "CNCF Annual Survey 2023",
      "IBM Cost of a Data Breach 2024",
      "DORA 2024",
    ]) {
      expect(text).toContain(required);
    }
    for (const color of bannedSourceColors) {
      expect(text.toUpperCase()).not.toContain(color);
    }
  });
});
