/**
 * Explicit GraphQL types for the YAML content in /content.
 *
 * Declaring the schema (instead of relying on inference) means optional
 * fields such as `toDate`, `repo` or `caseStudy` can be left out of every
 * entry without breaking page queries.
 */
module.exports = ({ actions }) => {
  actions.createTypes(`
    type ProfileYaml implements Node @dontInfer {
      profile: Profile
    }

    type Profile {
      initials: String
      fname: String!
      lname: String!
      profession: String!
      headline: String
      intro: String
      resumeSummary: String
      careerStart: String
      image: File @fileByRelativePath
      email: String
      availability: String
      focus: [String]
      education: [Education]
      about: [String]
      principles: [Principle]
      skillGroups: [SkillGroup]
    }

    type Education {
      qualification: String!
      institution: String!
    }

    type Principle {
      title: String!
      text: String!
    }

    type SkillGroup {
      title: String!
      summary: String
      practice: [String]
      items: [String]
    }

    type JobYaml implements Node @dontInfer {
      order: Int
      company: Company!
      jobTitle: String!
      employmentType: String
      workplace: String
      fromDate: String!
      toDate: String
      current: Boolean
      summary: String
      highlights: [String]
      technologies: [String]
      note: String
    }

    type Company {
      name: String!
      url: String
      logo: File @fileByRelativePath
    }

    type ProjectYaml implements Node @dontInfer {
      slug: String!
      tier: String!
      order: Int
      name: String!
      tagline: String
      category: String
      status: String
      period: String
      year: Int
      role: String
      url: String
      repo: String
      image: File @fileByRelativePath
      summary: String
      highlights: [String]
      technologies: [String]
      caseStudy: CaseStudy
    }

    type CaseStudy {
      problem: [String]
      approach: [String]
      architecture: [ArchitectureLayer]
      decisions: [Decision]
      tradeoffs: [String]
      outcomes: [String]
      note: String
    }

    type ArchitectureLayer {
      label: String!
      nodes: [String]
      detail: String
    }

    type Decision {
      title: String!
      detail: String!
    }

    type SocialYaml implements Node @dontInfer {
      name: String!
      url: String!
    }
  `);
};
