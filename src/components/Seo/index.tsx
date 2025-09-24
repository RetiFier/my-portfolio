import React from "react";
import { Helmet } from "react-helmet";
import { useStaticQuery, graphql } from "gatsby";

export function SEO({
  description = "Personal Website of JavaScript Developer",
  lang = "en",
  meta = [],
  title,
  keywords = "",
}: SEOProps) {
  const { site } = useStaticQuery<QueryTypes>(SEOStaticQuery);

  const metaDescription = description || site.siteMetadata.description;
  const defaultTitle = site.siteMetadata?.title;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={defaultTitle ? `%s | ${defaultTitle}` : undefined}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata?.author || ``,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
        ...(keywords ? [{ name: `keywords`, content: keywords }] : []),
      ].concat(meta)}
    />
  );
}

// Types
type SEOProps = {
  description?: string;
  lang?: string;
  meta?: Meta;
  title: string;
  keywords?: string;
};

type Meta = ConcatArray<PropertyMetaObj | NameMetaObj>;

type PropertyMetaObj = {
  property: string;
  content: string;
};

type NameMetaObj = {
  name: string;
  content: string;
};

type QueryTypes = {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      author: string;
    };
  };
};

// Export alias for compatibility
export const Seo = SEO;

// Queries
const SEOStaticQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`;
