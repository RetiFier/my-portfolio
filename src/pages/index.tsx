import { graphql } from "gatsby";
import * as React from "react";
import { AboutDataType } from "../@types/about";
import { Footer } from "../components/Footer";
import { Layout } from "../components/Layout";
import ThemeContextProvider from "../context/ThemeContextProvider";
import { About } from "./About";

// markup
const IndexPage = ({ data }: AboutDataType) => {
  const { profile, social, job, project } = data;
  return (
    <ThemeContextProvider>
      <Layout social={social.nodes}>
        <About profile={profile} job={job.nodes} project={project.nodes} />
      </Layout>
    </ThemeContextProvider>
  );
};

export const query = graphql`
  query {
    profile: profileYaml {
      about
      company
      for_hire
      image {
        childImageSharp {
          gatsbyImageData(layout: FIXED, width: 64, height: 64, quality: 85)
        }
        publicURL
      }
      initials
      location
      fname
      lname
      profession
      relocation
      skills
      tools
    }
    project: allProjectYaml(sort: { fields: date, order: DESC }) {
      nodes {
        project {
          name
          logo {
            childImageSharp {
              gatsbyImageData(layout: FIXED, width: 64, height: 64, quality: 85)
            }
            publicURL
          }
          url
        }
        name
        date
        technologies
        description
      }
    }
    job: allJobYaml(sort: { fields: fromDate, order: DESC }) {
      nodes {
        company {
          name
          logo {
            childImageSharp {
              gatsbyImageData(layout: FIXED, width: 64, height: 64, quality: 85)
            }
            publicURL
          }
          url
        }
        jobTitle
        fromDate
        toDate
        technologies
        description
      }
    }
    social: allSocialYaml(filter: { url: { ne: null } }) {
      nodes {
        name
        url
      }
    }
  }
`;

export default IndexPage;
