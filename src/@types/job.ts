import { CompanyType } from "./company";

export interface JobType {
  id: string;
  order: number | null;
  company: CompanyType;
  jobTitle: string;
  employmentType: string | null;
  workplace: string | null;
  /** ISO "YYYY-MM" */
  fromDate: string;
  /** ISO "YYYY-MM"; null for current or open-ended roles */
  toDate: string | null;
  current: boolean | null;
  summary: string | null;
  highlights: string[] | null;
  technologies: string[] | null;
  note: string | null;
}
