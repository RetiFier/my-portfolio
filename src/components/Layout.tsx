import React from "react";
import { MotionConfig } from "framer-motion";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { ScrollProgress } from "./ScrollProgress";
import { CommandPalette } from "./CommandPalette";
import { Hud } from "./Hud";
import { Explore } from "./Explore";
import { Toaster } from "./Toaster";
import { useSiteData } from "../hooks/useSiteData";

interface LayoutProps {
  children: React.ReactNode;
  /** Pass the page's `location.pathname` so navigation knows if it is on the home page. */
  pathname: string;
  showProgress?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, pathname, showProgress = true }) => {
  const { fullName } = useSiteData();
  const isHome = pathname === "/" || pathname === "";


  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main-content"
        className="no-print sr-only z-[100] bg-ink px-4 py-2 text-sm text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {showProgress && <ScrollProgress />}
      <Navigation isHome={isHome} name={fullName} />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <Hud isHome={isHome} />
      <CommandPalette isHome={isHome} />
      <Explore isHome={isHome} />
      <Toaster />
    </MotionConfig>
  );
};
