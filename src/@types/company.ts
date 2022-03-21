import { IGatsbyImageData } from "gatsby-plugin-image";

export interface CompanyType {
  name: string;
  url: string;
  logo: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData;
    };
  };
}
