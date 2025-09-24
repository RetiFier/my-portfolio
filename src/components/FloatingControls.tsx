import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiShare2, FiSun, FiMoon } from 'react-icons/fi';
import { Social } from './Social';
import { ThemeToggle } from './ThemeToggle';

interface FloatingControlsProps {
  social: any[];
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({ social }) => {
  const [isOpen, setIsOpen] = useState(false);

  const containerVariants = {
    closed: {},
    open: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    closed: { y: 20, opacity: 0 },
    open: { y: 0, opacity: 1 },
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <motion.div variants={containerVariants} initial="closed" animate={isOpen ? 'open' : 'closed'}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={itemVariants}
              exit={{ y: 20, opacity: 0 }}
              className="flex flex-col items-center space-y-3 mb-3"
            >
              <div className="p-2 bg-[#1a1b26] bg-opacity-90 backdrop-blur-md rounded-full shadow-lg border border-[#7aa2f7]/20">
                <ThemeToggle />
              </div>
              <div className="p-2 bg-[#1a1b26] bg-opacity-90 backdrop-blur-md rounded-full shadow-lg border border-[#7aa2f7]/20">
                <Social social={social} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{
            background: 'linear-gradient(145deg, #7aa2f7, #bb9af7)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close controls' : 'Open controls'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'x' : 'plus'}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <FiX size={16} /> : <FiPlus size={16} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FloatingControls;
