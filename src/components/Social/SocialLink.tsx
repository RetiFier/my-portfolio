import React from "react";
import { SocialType } from "../../@types/about";
import SocialIcon from "./SocialIcon";

type socialProps = {
  social: SocialType[];
};

const SocialLink = ({ social }: socialProps) => {
  return (
    <div className="pl-4">
      {social.map(({ name, url }, i) => {
        const colorsClass =
          i % 2 === 0 ? "bg-black text-white" : "bg-white text-black";
        return (
          <a
            aria-label={name}
            href={url}
            key={name}
            rel="noopener noreferrer"
            target="_blank"
            className={`inline-flex w-12 h-12 justify-center items-center rounded-full -ml-3 ${colorsClass} hover:shadow-lg transition-shadow duration-150`}
          >
            <SocialIcon name={name} className="w-6 h-6" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLink;
