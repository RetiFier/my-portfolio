import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

interface ScrollIndicatorProps {
  showAfterScroll?: boolean;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ 
  showAfterScroll = false 
}) => {
  const [isVisible, setIsVisible] = useState(!showAfterScroll);

  useEffect(() => {
    if (!showAfterScroll) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show indicator when user has scrolled past first section
      setIsVisible(scrollY > windowHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  const scrollToNextSection = () => {
    const windowHeight = window.innerHeight;
    const currentPosition = window.scrollY;
    const nextSectionPosition = Math.ceil(currentPosition / windowHeight) * windowHeight;
    
    window.scrollTo({
      top: nextSectionPosition + 10, // Add a small offset to ensure we trigger the next section
      behavior: 'smooth'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: isVisible ? 0.7 : 0,
        y: isVisible ? 0 : -10
      }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-24 left-20 z-30"
    >
      <motion.button
        onClick={scrollToNextSection}
        className="w-8 h-8 rounded-full bg-[#1a1b26] bg-opacity-70 backdrop-blur-md flex items-center justify-center shadow-md border border-[#7aa2f7]/20"
        whileHover={{ y: 2, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, 3, 0] }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }
        }}
        aria-label="Scroll to next section"
      >
        <FiChevronDown className="text-[#7aa2f7] w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

export default ScrollIndicator;
