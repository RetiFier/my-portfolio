import React from 'react';
import { motion } from 'framer-motion';

interface SkipLink {
  href: string;
  label: string;
}

const skipLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#hero', label: 'Skip to hero section' },
  { href: '#timeline', label: 'Skip to experience' },
  { href: '#projects', label: 'Skip to projects' },
  { href: '#skills', label: 'Skip to skills' },
  { href: '#contact', label: 'Skip to contact' },
];

export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <nav aria-label="Skip navigation links" className="fixed top-0 left-0 z-[100]">
        <ul className="flex flex-col">
          {skipLinks.map((link, index) => (
            <li key={link.href}>
              <motion.a
                href={link.href}
                className="block px-4 py-2 bg-blue-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                whileFocus={{ scale: 1.05 }}
                onFocus={(e) => {
                  // Announce to screen readers
                  const announcement = document.createElement('div');
                  announcement.setAttribute('aria-live', 'polite');
                  announcement.setAttribute('aria-atomic', 'true');
                  announcement.className = 'sr-only';
                  announcement.textContent = `Skip link focused: ${link.label}`;
                  document.body.appendChild(announcement);
                  
                  setTimeout(() => {
                    document.body.removeChild(announcement);
                  }, 1000);
                }}
              >
                {link.label}
              </motion.a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SkipLinks;
