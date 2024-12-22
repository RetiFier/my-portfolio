import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ThemeToggle } from './ThemeToggle';
import { Social } from './Social';

interface LayoutProps {
  children: React.ReactNode;
  social: any[];
  location: Location;
}

export const Layout: React.FC<LayoutProps> = ({ children, social, location }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen bg-[#1a1b26] text-[#a9b1d6] relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="matrix-text text-xs leading-3 text-[#9ece6a]">
          {Array(100).fill('01').join(' ')}
        </div>
      </div>

      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(122, 162, 247, 0.2) 0%, rgba(122, 162, 247, 0) 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(187, 154, 247, 0.2) 0%, rgba(187, 154, 247, 0) 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Terminal Lines */}
      <div className="fixed top-0 left-8 w-px h-full bg-gradient-to-b from-transparent via-[#7aa2f7] to-transparent opacity-20" />
      <div className="fixed top-0 right-8 w-px h-full bg-gradient-to-b from-transparent via-[#7aa2f7] to-transparent opacity-20" />

      {/* Header Controls */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 right-4 z-50 flex items-center space-x-4 px-4 py-2 rounded-lg"
        style={{
          background: 'rgba(31, 35, 53, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(122, 162, 247, 0.2)',
        }}
      >
        <Social social={social} />
        <div className="w-px h-6 bg-[#7aa2f7] opacity-20" />
        <ThemeToggle />
      </motion.div>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            ref={ref}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Line */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7aa2f7] to-transparent opacity-20" />
    </div>
  );
};
