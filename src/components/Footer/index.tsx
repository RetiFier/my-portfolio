import React from "react";
import { SocialType } from "../../@types/about";
import SocialLink from "../Social/SocialLink";

type footerProps = {
  social: SocialType[];
};

const Footer = ({ social }: footerProps) => {
  return (
    <footer className="flex justify-between mt-8 md:mt-20 px-4 md:px-20 py-8">
      <span>&copy; {new Date().getFullYear()} Reti Fier</span>
      <SocialLink social={social} />
    </footer>
  );
};

export { Footer };
