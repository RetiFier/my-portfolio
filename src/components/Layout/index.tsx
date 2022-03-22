import React, { FC, useState, useEffect } from "react";

import { SocialType } from "../../@types/about";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { Loader } from "../Loader";
import { SEO } from "../Seo";

type SocialProps = {
  social: SocialType[];
  location: Location;
};

export const Layout: FC<SocialProps> = ({ children, social, location }) => {
  const isHome = location.pathname === "/";
  const [isLoading, setIsLoading] = useState(isHome);
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (location.hash) {
      const id = location.hash.substring(1); // location.hash without the '#'
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
          el.focus();
        }
      }, 0);
    }
  }, [isLoading]);
  useEffect(() => {
    if (isHome) {
      let timeout = setTimeout(() => setIsLoading(false), 5000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isHome]);

  return (
    <>
      <SEO title="Reti Fier" />
      <div className="flex flex-col justify-between min-h-screen">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="ease-in-out duration-300 ">
            <Header />
            <main>{children}</main>
            <Footer social={social} />
          </div>
        )}
      </div>
    </>
  );
};
