import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

import { brands } from "../data/brands";
import { servicePillars } from "../data/services";

const staticPaths = [
  "/",
  "/about",
  "/services",
  "/resources/modernization-deck",
  "/case-studies",
  "/careers",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
  "/brand",
];

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site ?? new URL("https://northlace.example");
  const [caseStudies, careers, blogPosts] = await Promise.all([
    getCollection("case-studies"),
    getCollection("careers"),
    getCollection("blog"),
  ]);
  const dynamicPaths = [
    ...servicePillars.map((pillar) => pillar.href),
    ...brands.map((brand) => `/brand/${brand.slug}`),
    ...caseStudies
      .filter((entry) => !entry.data.draft)
      .map((entry) => `/case-studies/${entry.id}`),
    ...careers
      .filter((entry) => !entry.data.draft)
      .map((entry) => `/careers/${entry.id}`),
    ...blogPosts.map((entry) => `/blog/${entry.id}`),
  ];
  const paths = Array.from(new Set([...staticPaths, ...dynamicPaths])).sort();
  const urls = paths
    .map(
      (path) =>
        `  <url><loc>${escapeXml(new URL(path, siteUrl).toString())}</loc></url>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
};
