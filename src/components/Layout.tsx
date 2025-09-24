import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ThemeToggle } from './ThemeToggle';
import { Social } from './Social';
import { FiChevronUp } from 'react-icons/fi';
import { FloatingControls } from './FloatingControls';
import { ScrollIndicator } from './ScrollIndicator';

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

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle scroll events
  useEffect(() => {
    // Prevent initial scroll issues
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Only call handleScroll initially after a delay to prevent auto-scroll
    const scrollTimer = setTimeout(() => {
      handleScroll();
    }, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
      clearTimeout(scrollTimer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-48 h-48 md:w-96 md:h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(122, 162, 247, 0.2) 0%, rgba(122, 162, 247, 0) 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div 
          className="absolute -bottom-20 -left-20 md:-bottom-40 md:-left-40 w-48 h-48 md:w-96 md:h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(187, 154, 247, 0.2) 0%, rgba(187, 154, 247, 0) 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Terminal Lines */}
      <div className="fixed top-0 left-2 md:left-8 w-px h-full bg-gradient-to-b from-transparent via-[#7aa2f7] to-transparent opacity-20" />
      <div className="fixed top-0 right-2 md:right-8 w-px h-full bg-gradient-to-b from-transparent via-[#7aa2f7] to-transparent opacity-20" />

      {/* Logo/Brand */}
      <div className="fixed top-6 right-6 z-50">
        <motion.div 
          className="flex items-center cursor-pointer"
          onClick={scrollToTop}
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] flex items-center justify-center">
            <span className="text-white font-bold text-lg">RF</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Controls */}
      <FloatingControls social={social} />
      
      {/* Scroll Indicator */}
      <ScrollIndicator />

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-20 z-40 p-2 rounded-full shadow-lg transition-colors"
            style={{
              background: 'rgba(122, 162, 247, 0.9)',
              backdropFilter: 'blur(8px)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiChevronUp className="w-4 h-4 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-16">
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
