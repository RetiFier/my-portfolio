import React, { useState } from 'react';
import { Link } from 'gatsby';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-opacity-80 bg-[#1f2335] border border-[#7aa2f7] border-opacity-20"
      >
        <div className="w-6 h-5 relative flex flex-col justify-between">
          <span className={`w-full h-0.5 bg-[#7aa2f7] transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-full h-0.5 bg-[#7aa2f7] transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`w-full h-0.5 bg-[#7aa2f7] transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="fixed md:hidden top-0 left-0 w-64 h-full bg-[#1f2335] bg-opacity-95 backdrop-blur-lg z-40 border-r border-[#7aa2f7] border-opacity-20"
          >
            <div className="flex flex-col space-y-6 pt-20 px-6">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors duration-200 hover:text-[#7aa2f7] ${
                      location.pathname === item.path
                        ? 'text-[#7aa2f7]'
                        : 'text-gray-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Navigation */}
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
              className={`text-lg font-medium transition-colors duration-200 hover:text-[#7aa2f7] ${
                location.pathname === item.path
                  ? 'text-[#7aa2f7]'
                  : 'text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
};
