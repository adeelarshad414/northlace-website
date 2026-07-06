import { describe, expect, it } from "vitest";

import { brands } from "../../src/data/brands";

const expected = [
  {
    name: "Northlace",
    slug: "northlace",
    tagline: "Every cloud. One standard.",
  },
  {
    name: "Adeel Codes Cloud",
    slug: "adeel-codes-cloud",
    tagline: "Cloud, DevOps, and the career behind it.",
  },
  {
    name: "Signal & Scale",
    slug: "signal-and-scale",
    tagline: "Cutting the noise on cloud, careers, and AI-native work.",
  },
  {
    name: "The Cloud Lounge",
    slug: "the-cloud-lounge",
    tagline: "Where infrastructure unwinds.",
  },
];

describe("brand data", () => {
  it("exports exactly the four binding brands in order", () => {
    expect(
      brands.map(({ name, slug, tagline }) => ({ name, slug, tagline })),
    ).toEqual(expected);
  });

  it("keeps every brand complete enough to drive generated assets and pages", () => {
    for (const brand of brands) {
      expect(brand.pillars).toHaveLength(4);
      expect(brand.palette.length).toBeGreaterThanOrEqual(7);
      expect(brand.pending.length).toBeGreaterThanOrEqual(3);
      expect(brand.logoGeometry.length).toBeGreaterThan(60);
      expect(brand.palette.map((color) => color.hex)).not.toContain("#FFFFFF");
      expect(Object.values(brand.assets)).toEqual([
        `/brand/${brand.slug}/${brand.slug}-deck-template.pptx`,
        `/brand/${brand.slug}/${brand.slug}-brand-guidelines.pdf`,
        `/brand/${brand.slug}/${brand.slug}-icon-transparent.svg`,
        `/brand/${brand.slug}/${brand.slug}-lockup-horizontal-dark.svg`,
        `/brand/${brand.slug}/${brand.slug}-lockup-horizontal-light.svg`,
        `/brand/${brand.slug}/${brand.slug}-mark-dark.svg`,
        `/brand/${brand.slug}/${brand.slug}-mark-light.svg`,
        `/brand/${brand.slug}/${brand.slug}-og.png`,
      ]);
    }
  });

  it("keeps pending facts explicit instead of inventing public handles", () => {
    const allText = JSON.stringify(brands);

    expect(allText).not.toMatch(/@[A-Za-z0-9_]+/);
    expect(allText).not.toContain("™");
    expect(allText).toContain("Northlace trademark clearance");
    expect(allText).toContain("The Cloud Lounge name collision check");
  });
});
