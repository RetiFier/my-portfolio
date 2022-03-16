import { graphql } from "gatsby";
import * as React from "react";
import { AboutDataType } from "../@types/about";
import { Footer } from "../components/Footer";
import { Layout } from "../components/Layout";
import { About } from "./About";

// markup
const IndexPage = ({ data }: AboutDataType) => {
  const { profile, social } = data;
  console.log(data);
  return (
    <Layout>
      <About />
    </Layout>
  );
};

export const query = graphql`
  query {
    profile: profileYaml {
      about
      company
      focus
      focus_url
      for_hire
      image {
        childImageSharp {
          gatsbyImageData(layout: FIXED, width: 65, height: 65, quality: 95)
        }
        publicURL
      }
      initials
      location
      name
      profession
      relocation
      skills
      tools
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
