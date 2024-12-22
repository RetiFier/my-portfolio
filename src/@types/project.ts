import { IGatsbyImageData } from "gatsby-plugin-image";

interface ProjectDetails {
  name: string;
  logo?: {
    childImageSharp?: {
      gatsbyImageData: IGatsbyImageData;
    };
    publicURL?: string;
  };
  url: string;
}

export interface ProjectType {
  project: ProjectDetails;
  name: string;
  date: string;
  technologies: string[];
  description: string;
}
