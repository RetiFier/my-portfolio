import React, { FC, useEffect } from "react";
import { SocialType } from "../../@types/about";
import { Footer } from "../Footer";
import { Header } from "../Header";

type SocialProps = {
  social: SocialType[];
};

export const Layout: FC<SocialProps> = ({ children, social }) => {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer social={social} />
    </div>
  );
};
