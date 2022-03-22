import { JobType } from "./job";
import { ProjectType } from "./project";

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
  fname: string;
  lname: string;
  profession: string;
  skills: string[];
}
