import { ImageFile } from "./image";

export interface SocialType {
  name: string;
  url: string;
}

export interface Principle {
  title: string;
  text: string;
}

export interface Education {
  qualification: string;
  institution: string;
}

export interface SkillGroup {
  title: string;
  summary: string | null;
  practice: string[] | null;
  items: string[] | null;
}

export interface ProfileType {
  initials: string | null;
  fname: string;
  lname: string;
  profession: string;
  headline: string | null;
  intro: string | null;
  resumeSummary?: string | null;
  careerStart: string | null;
  image?: ImageFile | null;
  email: string | null;
  availability: string | null;
  focus: string[] | null;
  education?: Education[] | null;
  about: string[] | null;
  principles: Principle[] | null;
  skillGroups: SkillGroup[] | null;
}
