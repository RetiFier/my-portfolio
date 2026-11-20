import React from "react";
import { useSiteData } from "../../hooks/useSiteData";

interface SeoProps {
  title?: string;
  description?: string;
  pathname?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  /** Adds Person + WebSite structured data (home page). */
  person?: boolean;
  /** Breadcrumb trail for inner pages, e.g. [{ name: "Work", path: "/#work" }]. */
  breadcrumbs?: Array<{ name: string; path: string }>;
  noindex?: boolean;
  children?: React.ReactNode;
}

/**
 * Document head for Gatsby's Head API. Use inside a page's `export const Head`.
 */
export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  pathname = "/",
  image,
  type = "website",
  person = false,
  breadcrumbs,
  noindex = false,
  children,
}) => {
  const { site, profile, fullName, social } = useSiteData();
  const siteUrl = site.siteUrl.replace(/\/$/, "");
  const fullTitle = title ? `${title} — ${site.title}` : `${fullName} — ${profile.profession}`;
  const metaDescription = description || site.description;
  const url = `${siteUrl}${pathname}`;
  const imageUrl = `${siteUrl}${image || site.image}`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: fullName,
    jobTitle: profile.profession,
    description: site.description,
    image: imageUrl,
    url: siteUrl,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    sameAs: social.map((s) => s.url),
    knowsAbout: [
      "Full-stack development",
      "SaaS platforms",
      "Backend systems",
      "Software architecture",
      "AI integrations",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.title,
    url: siteUrl,
    inLanguage: "en",
    author: { "@id": `${siteUrl}/#person` },
  };

  const breadcrumbSchema = breadcrumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: fullName, path: "/" }, ...breadcrumbs].map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: `${siteUrl}${b.path}`,
        })),
      }
    : null;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="author" content={fullName} />
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}

      <meta property="og:site_name" content={site.title} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullName}, ${profile.profession}`} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {person && <script type="application/ld+json">{JSON.stringify(personSchema)}</script>}
      {person && <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
      {children}
    </>
  );
};

export default Seo;
