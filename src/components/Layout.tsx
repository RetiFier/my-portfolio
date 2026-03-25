import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialType, ProfileType } from '../@types/about';
import { nightOwl } from '../theme/nightOwl';
import { Footer } from './Footer';
import { AccessibilityProvider } from './Accessibility/AccessibilityProvider';

interface LayoutProps {
  children: React.ReactNode;
  social: SocialType[];
  profile: ProfileType;
  location: Location;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  social,
  profile,
  location,
  showFooter = true,
}) => {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen text-[#f0f0f0]" style={{ backgroundColor: nightOwl.bg }}>
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {showFooter && <Footer social={social} profile={profile} />}
      </div>
    </AccessibilityProvider>
  );
};
