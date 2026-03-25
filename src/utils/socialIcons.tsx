import React from 'react';
import { FiGithub, FiLinkedin } from 'react-icons/fi';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  github: FiGithub,
  linkedin: FiLinkedin,
};

export const getSocialIcon = (name: string, className?: string) => {
  const cls = className || 'w-5 h-5';
  const Icon = iconMap[name.toLowerCase()] || FiGithub;
  return <Icon className={cls} />;
};
