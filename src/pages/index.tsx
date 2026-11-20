import React from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { Layout } from "../components/Layout";
import { Seo } from "../components/Seo";
import { Hero } from "../components/home/Hero";
import { FeaturedWork } from "../components/home/FeaturedWork";
import { MoreProjects } from "../components/home/MoreProjects";
import { Experience } from "../components/home/Experience";
import { About } from "../components/home/About";
import { Skills } from "../components/home/Skills";
import { Contact } from "../components/home/Contact";
import { Recovery } from "../components/home/Recovery";
import { NextSection } from "../components/motion";
import { ProfileType, SocialType } from "../@types/about";
import { JobType } from "../@types/job";
import { ProjectType } from "../@types/project";

interface IndexData {
  profile: { nodes: Array<{ profile: ProfileType }> };
  social: { nodes: SocialType[] };
  job: { nodes: JobType[] };
  project: { nodes: ProjectType[] };
}

const findSocial = (social: SocialType[], name: string) =>
  social.find((s) => s.name.toLowerCase() === name)?.url ?? null;

const IndexPage: React.FC<PageProps<IndexData>> = ({ data, location }) => {
  const profile = data.profile.nodes[0].profile;
  const social = data.social.nodes;
  const jobs = data.job.nodes;
  const projects = data.project.nodes;
  const linkedin = findSocial(social, "linkedin");
  const github = findSocial(social, "github");

  const byTier = (tier: ProjectType["tier"]) => projects.filter((p) => p.tier === tier);

  return (
    <Layout pathname={location.pathname}>
      <Hero profile={profile} jobs={jobs} productCount={byTier("featured").length} />
      <FeaturedWork projects={byTier("featured")} />
      <MoreProjects selected={byTier("selected")} archive={byTier("archive")} github={github} />
      <NextSection from="01 / Selected work" to="02 / Experience" href="#experience" className="pt-24 md:pt-32" />
      <Experience jobs={jobs} linkedin={linkedin} />
      <About profile={profile} />
      <Recovery principles={profile.principles} />
      <NextSection from="03 / About" to="04 / Capabilities" href="#skills" className="pt-24 md:pt-32" />
      {profile.skillGroups?.length ? <Skills groups={profile.skillGroups} /> : null}
      <NextSection from="04 / Capabilities" to="05 / Contact" href="#contact" className="pt-24 md:pt-32" />
      <Contact profile={profile} linkedin={linkedin} github={github} />
    </Layout>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <Seo person type="profile" />;

export const query = graphql`
  query HomePage {
    profile: allProfileYaml(limit: 1) {
      nodes {
        profile {
          initials
          fname
          lname
          profession
          headline
          intro
          careerStart
          email
          availability
          focus
          about
          education {
            qualification
            institution
          }
          principles {
            title
            text
          }
          skillGroups {
            title
            summary
            practice
            items
          }
        }
      }
    }
    social: allSocialYaml {
      nodes {
        name
        url
      }
    }
    job: allJobYaml(sort: { order: ASC }) {
      nodes {
        id
        order
        company {
          name
          url
          logo {
            childImageSharp {
              gatsbyImageData(layout: FIXED, width: 36, height: 36, quality: 90)
            }
          }
        }
        jobTitle
        employmentType
        workplace
        fromDate
        toDate
        current
        summary
        highlights
        technologies
        note
      }
    }
    project: allProjectYaml(sort: { order: ASC }) {
      nodes {
        slug
        tier
        order
        name
        tagline
        category
        status
        period
        year
        role
        url
        repo
        summary
        highlights
        technologies
        image {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED, width: 1100, quality: 82, placeholder: BLURRED)
          }
        }
        caseStudy {
          note
        }
      }
    }
  }
`;
