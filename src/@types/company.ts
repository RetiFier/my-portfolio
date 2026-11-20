import { ImageFile } from "./image";

export interface CompanyType {
  name: string;
  url: string | null;
  logo: ImageFile | null;
}
