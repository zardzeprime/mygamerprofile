export const SITE_ORIGIN = "https://impar-imp21.vercel.app";
export const SITE_NAME = "ÍMPAR";
export const SITE_FULL_NAME = "ÍMPAR — Sua identidade gamer";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/brand/impar-social.svg`;

type SeoOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  robots?: string;
};

export function absoluteSiteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_ORIGIN).toString();
}

export function buildSeo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
}: SeoOptions) {
  const url = absoluteSiteUrl(path);
  const imageUrl = image.startsWith("data:") ? DEFAULT_OG_IMAGE : absoluteSiteUrl(image);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: imageUrl },
      { property: "og:image:alt", content: `${SITE_NAME} — identidade gamer do seu jeito` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const SITE_STRUCTURED_DATA = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      name: SITE_NAME,
      alternateName: ["ÍMPAR", "ÍMPAR"],
      url: `${SITE_ORIGIN}/`,
      inLanguage: ["pt-BR", "en", "es"],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#organization`,
      name: SITE_NAME,
      alternateName: ["ÍMPAR", "ÍMPAR"],
      url: `${SITE_ORIGIN}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/brand/impar-logo.svg`,
      },
    },
  ],
});
