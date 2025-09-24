import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  loadingText?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
  loadingText = 'Loading section...'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView && !isLoaded) {
      // Simulate loading delay for smooth UX
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [inView, isLoaded]);

  const defaultFallback = (
    <div className={`min-h-[200px] flex items-center justify-center ${className}`}>
      <LoadingSpinner text={loadingText} />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isLoaded ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

export default LazySection;
