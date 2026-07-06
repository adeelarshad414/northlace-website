import type { APIRoute } from "astro";

const fallbackSiteUrl = new URL("https://northlace.example");

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? fallbackSiteUrl;
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${new URL("/sitemap.xml", origin).toString()}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
};
