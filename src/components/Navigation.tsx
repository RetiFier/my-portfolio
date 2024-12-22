import React from 'react';
import { Link } from 'gatsby';
import { motion } from 'framer-motion';

interface NavigationProps {
  location: Location;
}

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/projects', label: 'Projects' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export const Navigation: React.FC<NavigationProps> = ({ location }) => {
  return (
    <div className="hidden md:flex items-center space-x-8">
      {navItems.map((item, index) => (
        <motion.div
          key={item.path}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link
            to={item.path}
            className={`text-lg font-medium transition-colors duration-200 hover:text-blue-500 ${
              location.pathname === item.path
                ? 'text-blue-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {item.label}
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
