import React from "react";
import {
  FaBehance,
  FaDribbble,
  FaFacebook,
  FaGithub,
  FaGoodreadsG,
  FaMediumM,
  FaInstagram,
  FaLinkedinIn,
  FaProductHunt,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

type socialIconProps = {
  name:
    | "behance"
    | "dribbble"
    | "facebook"
    | "github"
    | "goodreads"
    | "medium"
    | "instagram"
    | "linkedin"
    | "producthunt"
    | "twitter"
    | "youtube";

  className?: string;
};

const SocialIcon = ({ name, className, ...params }: socialIconProps) => {
  const icons = {
    behance: FaBehance,
    dribbble: FaDribbble,
    facebook: FaFacebook,
    github: FaGithub,
    goodreads: FaGoodreadsG,
    medium: FaMediumM,
    instagram: FaInstagram,
    linkedin: FaLinkedinIn,
    producthunt: FaProductHunt,
    twitter: FaTwitter,
    youtube: FaYoutube,
  };
  const Icon = icons[name];

  return Icon ? <Icon {...params} className={className} /> : null;
};

export default SocialIcon;
