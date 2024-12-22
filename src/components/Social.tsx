import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

interface SocialProps {
  social: {
    name: string;
    url: string;
  }[];
}

const iconMap: { [key: string]: React.ComponentType } = {
  github: FiGithub,
  linkedin: FiLinkedin,
  twitter: FiTwitter,
};

export const Social: React.FC<SocialProps> = ({ social }) => {
  return (
    <div className="flex items-center space-x-4">
      {social.map((item, index) => {
        const Icon = iconMap[item.name.toLowerCase()];
        return (
          <motion.a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
          >
            {Icon && <Icon className="w-6 h-6" />}
          </motion.a>
        );
      })}
    </div>
  );
};
