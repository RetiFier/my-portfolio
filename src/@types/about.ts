import { JobType } from "./job";
import { ProjectType } from "./project";
import { IGatsbyImageData } from "gatsby-plugin-image";

export interface AboutDataType {
  data: {
    profile: ProfileType;
    social: { nodes: SocialType[] };
    job: { nodes: JobType[] };
    project: { nodes: ProjectType[] };
  };
  location: Location;
}

export interface SocialType {
  name:
    | "behance"
    | "dribbble"
    | "facebook"
    | "github"
    | "goodreads"
    | "medium"
    | "instagram"
    | "linkedin"
    | "producthunt"
    | "twitter"
    | "youtube";
  url: string;
}

export interface ProfileType {
  about: string;
  company: string;
  for_hire: boolean;
  image: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData;
    };
    publicURL: string;
  };
  initials: string;
  location: string;
  fname: string;
  lname: string;
  profession: string;
  relocation: boolean;
  skills: string[];
  tools: string[];
}
