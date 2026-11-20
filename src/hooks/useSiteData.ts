import { graphql, useStaticQuery } from "gatsby";
import { SocialType } from "../@types/about";

interface SiteData {
  site: {
    buildTime: string;
    siteMetadata: {
      title: string;
      description: string;
      siteUrl: string;
      image: string;
      author: string;
    };
  };
  profile: {
    nodes: Array<{
      profile: {
        fname: string;
        lname: string;
        profession: string;
        email: string | null;
        availability: string | null;
      };
    }>;
  };
  social: { nodes: SocialType[] };
}

/** Site-wide data used by the layout, navigation, footer and SEO. */
export const useSiteData = () => {
  const data = useStaticQuery<SiteData>(graphql`
    query SiteData {
      site {
        buildTime
        siteMetadata {
          title
          description
          siteUrl
          image
          author
        }
      }
      profile: allProfileYaml(limit: 1) {
        nodes {
          profile {
            fname
            lname
            profession
            email
            availability
          }
        }
      }
      social: allSocialYaml {
        nodes {
          name
          url
        }
      }
    }
  `);

  const profile = data.profile.nodes[0].profile;
  const social = data.social.nodes;
  const findSocial = (name: string) => social.find((s) => s.name.toLowerCase() === name)?.url ?? null;

  return {
    site: data.site.siteMetadata,
    /** Build date: used instead of `new Date()` so server HTML and hydration agree. */
    now: new Date(data.site.buildTime),
    profile,
    fullName: `${profile.fname} ${profile.lname}`,
    social,
    linkedin: findSocial("linkedin"),
    github: findSocial("github"),
  };
};
