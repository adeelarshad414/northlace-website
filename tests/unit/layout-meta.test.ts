import { describe, expect, it } from "vitest";

import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildPageMeta,
} from "../../src/lib/seo";

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
      ogImageHeight: 630,
      ogImageUrl: "https://northlace.example/og/services.png",
      ogImageWidth: 1200,
      siteName: "Northlace",
      title: "Services | Northlace",
      twitterCard: "summary_large_image",
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

  it("builds breadcrumb JSON-LD with absolute URLs", () => {
    const schema = buildBreadcrumbJsonLd(new URL("https://northlace.example"), [
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
    ]);

    expect(schema).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          item: "https://northlace.example/",
          name: "Home",
          position: 1,
        },
        {
          item: "https://northlace.example/services",
          name: "Services",
          position: 2,
        },
      ],
    });
  });

  it("builds article JSON-LD with publication metadata", () => {
    const schema = buildArticleJsonLd({
      author: "Adeel Arshad",
      canonicalPath: "/blog/example",
      description: "Example article summary.",
      image: "/og/example.svg",
      publishDate: new Date("2026-06-30T00:00:00.000Z"),
      siteUrl: new URL("https://northlace.example"),
      title: "Example Article",
    });

    expect(schema).toMatchObject({
      "@type": "Article",
      author: {
        "@type": "Person",
        name: "Adeel Arshad",
      },
      datePublished: "2026-06-30T00:00:00.000Z",
      headline: "Example Article",
      image: "https://northlace.example/og/example.svg",
      mainEntityOfPage: "https://northlace.example/blog/example",
    });
  });
});
