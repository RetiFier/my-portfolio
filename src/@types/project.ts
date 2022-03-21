import { CompanyType } from "./company";

export interface ProjectType {
  project: CompanyType;
  name: string;
  date: string;
  technologies: string[];
  description: string;
}
