import { IGatsbyImageData } from "gatsby-plugin-image";

export interface ImageFile {
  childImageSharp?: {
    gatsbyImageData: IGatsbyImageData;
  } | null;
  publicURL?: string | null;
}
