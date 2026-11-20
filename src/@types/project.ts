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

/**
 * A project-specific section between "Key decisions" and "Tradeoffs".
 * `visuals` names interactive figures registered in `visuals/deepDiveVisuals`.
 */
export interface DeepDive {
  id: string;
  label: string;
  title: string;
  lead: string[] | null;
  points: Decision[] | null;
  visuals: string[] | null;
}

export interface CaseStudy {
  problem: string[] | null;
  approach: string[] | null;
  architecture: ArchitectureLayer[] | null;
  decisions: Decision[] | null;
  deepDives: DeepDive[] | null;
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
