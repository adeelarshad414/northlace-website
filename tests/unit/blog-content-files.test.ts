import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { describe, expect, it } from "vitest";

import { blogSchema } from "../../src/content/schemas";

const blogPostPaths = [
  {
    brandName: "Adeel Codes Cloud",
    relativePath: "src/content/blog/adeel-codes-cloud-launch.mdx",
  },
  {
    brandName: "Signal &amp; Scale",
    relativePath: "src/content/blog/signal-and-scale-launch.mdx",
  },
  {
    brandName: "The Cloud Lounge",
    relativePath: "src/content/blog/the-cloud-lounge-launch.mdx",
  },
];

describe("brand launch blog post files", () => {
  it.each(blogPostPaths)(
    "validates $relativePath against the blog schema and inline hero contract",
    ({ brandName, relativePath }) => {
      const filePath = path.join(process.cwd(), relativePath);
      const parsed = matter(fs.readFileSync(filePath, "utf8"));
      const result = blogSchema.safeParse(parsed.data);

      expect(result.success).toBe(true);
      expect(parsed.data.heroImage).toMatch(/^\/og\/.+\.svg$/);
      expect(parsed.content).toContain("<svg");
      expect(parsed.content).toMatch(new RegExp(`<h1[\\s\\S]*?${brandName}`));
      expect(parsed.content).not.toContain("#TODO-LINK");
      expect(parsed.content).toMatch(/pending final\s+channel\s+approval/);
      expect(
        parsed.content.match(
          /^## (What To Expect|Brand Palette|Where To Find It)$/gm,
        ),
      ).toEqual([
        "## What To Expect",
        "## Brand Palette",
        "## Where To Find It",
      ]);
    },
  );
});
