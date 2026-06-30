interface BuildPageMetaInput {
  canonicalPath: string;
  description: string;
  ogImage: string;
  siteUrl: URL;
  title: string;
}

export const buildPageMeta = ({
  canonicalPath,
  description,
  ogImage,
  siteUrl,
  title,
}: BuildPageMetaInput) => ({
  canonicalUrl: new URL(canonicalPath, siteUrl).toString(),
  description,
  ogImageUrl: new URL(ogImage, siteUrl).toString(),
  title,
});
