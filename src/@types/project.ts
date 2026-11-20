import { ImageFile } from "./image";

export type ProjectTier = "featured" | "selected" | "archive";

export interface ArchitectureLayer {
  label: string;
  nodes: string[] | null;
  detail: string | null;
}

export interface Decision {
  title: string;
  detail: string;
}

export interface CaseStudy {
  problem: string[] | null;
  approach: string[] | null;
  architecture: ArchitectureLayer[] | null;
  decisions: Decision[] | null;
  tradeoffs: string[] | null;
  outcomes: string[] | null;
  note: string | null;
}

export interface ProjectType {
  slug: string;
  tier: ProjectTier;
  order: number | null;
  name: string;
  tagline: string | null;
  category: string | null;
  status: string | null;
  period: string | null;
  year: number | null;
  role: string | null;
  url: string | null;
  repo: string | null;
  image: ImageFile | null;
  summary: string | null;
  highlights: string[] | null;
  technologies: string[] | null;
  /** Only the presence of a case study is needed on the home page. */
  caseStudy: Partial<CaseStudy> | null;
}
