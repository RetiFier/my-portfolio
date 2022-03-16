import { CompanyType } from "./company";

export interface JobType {
  company: CompanyType;
  jobTitle: string;
  fromDate: string;
  toDate: string | null;
  technologies: string[];
  description: string;
}
