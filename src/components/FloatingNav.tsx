import React from 'react';
import { motion } from 'framer-motion';

interface FloatingNavProps {
  navigationItems: { id: string; label: string }[];
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  navigationItems,
  activeSection,
  scrollToSection,
}) => {
  return (
    <nav
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
      aria-label="Page section navigation"
    >
      <ul className="flex flex-col items-center space-y-4">
        {navigationItems.map(item => (
          <li key={item.id} className="relative group">
            <button
              onClick={() => scrollToSection(item.id)}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  activeSection === item.id ? '#7aa2f7' : '#5f7e97',
              }}
              aria-label={`Go to ${item.label} section`}
              aria-current={activeSection === item.id ? 'step' : undefined}
            />
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3 py-1 bg-[#1a1b26] text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
              {item.label}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default FloatingNav;
