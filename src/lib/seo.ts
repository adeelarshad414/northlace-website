export type JsonLd = Record<string, unknown>;

interface BuildPageMetaInput {
  canonicalPath: string;
  description: string;
  ogImage: string;
  siteUrl: URL;
  title: string;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BuildArticleInput {
  author: string;
  canonicalPath: string;
  description: string;
  image: string;
  publishDate: Date;
  siteUrl: URL;
  title: string;
}

export const defaultOgImage = "/og/northlace-default.svg";
export const siteName = "Northlace";

export const buildPageMeta = ({
  canonicalPath,
  description,
  ogImage,
  siteUrl,
  title,
}: BuildPageMetaInput) => ({
  canonicalUrl: new URL(canonicalPath, siteUrl).toString(),
  description,
  ogImageHeight: 630,
  ogImageUrl: new URL(ogImage, siteUrl).toString(),
  ogImageWidth: 1200,
  siteName,
  title,
  twitterCard: "summary_large_image",
});

export const buildOrganizationJsonLd = (siteUrl: URL): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  logo: new URL("/favicon.svg", siteUrl).toString(),
  name: siteName,
  url: new URL("/", siteUrl).toString(),
});

export const buildWebSiteJsonLd = (siteUrl: URL): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: new URL("/", siteUrl).toString(),
});

export const buildBreadcrumbJsonLd = (
  siteUrl: URL,
  items: BreadcrumbItem[],
): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    item: new URL(item.path, siteUrl).toString(),
    name: item.name,
    position: index + 1,
  })),
});

export const buildArticleJsonLd = ({
  author,
  canonicalPath,
  description,
  image,
  publishDate,
  siteUrl,
  title,
}: BuildArticleInput): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Article",
  author: {
    "@type": "Person",
    name: author,
  },
  datePublished: publishDate.toISOString(),
  description,
  headline: title,
  image: new URL(image, siteUrl).toString(),
  mainEntityOfPage: new URL(canonicalPath, siteUrl).toString(),
  publisher: {
    "@type": "Organization",
    name: siteName,
  },
});
