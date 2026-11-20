import React from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { ImageFile } from "../../@types/image";

interface BrowserFrameProps {
  image: ImageFile | null;
  alt: string;
  url?: string | null;
  className?: string;
}

/** A restrained browser chrome around a real product screenshot. */
export const BrowserFrame: React.FC<BrowserFrameProps> = ({ image, alt, url, className = "" }) => {
  const data = image?.childImageSharp ? getImage(image.childImageSharp.gatsbyImageData) : undefined;
  if (!data) return null;
  const host = url ? url.replace(/^https?:\/\//, "").replace(/\/$/, "") : null;

  return (
    <figure className={`overflow-hidden border border-line bg-surface ${className}`}>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="font-mono text-label uppercase tracking-[0.05em] text-faint" aria-hidden="true">
          https://
        </span>
        {host && (
          <span className="mr-auto truncate font-mono text-label text-ink">{host}</span>
        )}
        <span className="font-mono text-label uppercase tracking-[0.05em] text-faint" aria-hidden="true">screenshot</span>
      </div>
      <GatsbyImage image={data} alt={alt} className="block" />
    </figure>
  );
};
