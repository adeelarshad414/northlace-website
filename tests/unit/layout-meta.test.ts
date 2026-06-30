import { describe, expect, it } from "vitest";

import { buildPageMeta } from "../../src/lib/seo";

describe("Layout metadata", () => {
  it("builds title and meta description from the first prop set", () => {
    const meta = buildPageMeta({
      canonicalPath: "/services",
      description:
        "Northlace services for cloud, security, finance operations, and modernization.",
      ogImage: "/og/services.png",
      siteUrl: new URL("https://northlace.example"),
      title: "Services | Northlace",
    });

    expect(meta).toEqual({
      canonicalUrl: "https://northlace.example/services",
      description:
        "Northlace services for cloud, security, finance operations, and modernization.",
      ogImageUrl: "https://northlace.example/og/services.png",
      title: "Services | Northlace",
    });
  });

  it("builds title and meta description from a second prop set", () => {
    const meta = buildPageMeta({
      canonicalPath: "/about",
      description:
        "Learn how Northlace builds a consistent operating standard for cloud teams.",
      ogImage: "/og/about.png",
      siteUrl: new URL("https://northlace.example"),
      title: "About | Northlace",
    });

    expect(meta.title).toBe("About | Northlace");
    expect(meta.description).toBe(
      "Learn how Northlace builds a consistent operating standard for cloud teams.",
    );
    expect(meta.canonicalUrl).toBe("https://northlace.example/about");
  });
});
