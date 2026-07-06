import fs from "node:fs";
import path from "node:path";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { brands } from "../../src/data/brands";

const publicDir = path.join(process.cwd(), "public");

const svgFiles = brands.flatMap((brand) =>
  [
    `${brand.slug}-icon-transparent.svg`,
    `${brand.slug}-mark-dark.svg`,
    `${brand.slug}-mark-light.svg`,
    `${brand.slug}-lockup-horizontal-dark.svg`,
    `${brand.slug}-lockup-horizontal-light.svg`,
  ].map((name) => ({
    brand,
    diskPath: path.join(publicDir, "brand", brand.slug, name),
    name,
  })),
);

describe("brand SVG assets", () => {
  it("parses all 20 generated SVG logo files as XML", () => {
    expect(svgFiles).toHaveLength(20);

    for (const file of svgFiles) {
      const contents = fs.readFileSync(file.diskPath, "utf8");
      const dom = new JSDOM(contents, { contentType: "image/svg+xml" });

      expect(
        dom.window.document.querySelector("parsererror"),
        file.name,
      ).toBeNull();
      expect(contents, file.name).toContain('stroke-linecap="round"');
      expect(contents, file.name).not.toContain("#FFFFFF");
    }
  });

  it("keeps mark/icon SVGs at 400x400 and lockups at 1400x400", () => {
    for (const file of svgFiles) {
      const dom = new JSDOM(fs.readFileSync(file.diskPath, "utf8"), {
        contentType: "image/svg+xml",
      });
      const root = dom.window.document.documentElement;

      if (file.name.includes("lockup")) {
        expect(root.getAttribute("width"), file.name).toBe("1400");
        expect(root.getAttribute("height"), file.name).toBe("400");
        expect(root.getAttribute("viewBox"), file.name).toBe("0 0 1400 400");
      } else {
        expect(root.getAttribute("width"), file.name).toBe("400");
        expect(root.getAttribute("height"), file.name).toBe("400");
        expect(root.getAttribute("viewBox"), file.name).toBe("0 0 400 400");
      }
    }
  });
});
