import React, { FC, useEffect } from "react";
import { Footer } from "../Footer";

export const Layout: FC = ({ children }) => {
  // const { resolvedTheme } = useTheme();

  // useEffect(() => {
  // 	const favicon = document.querySelector("link[rel~='icon']") as any;
  // 	if (favicon) favicon.href = `/assets/favicon_${resolvedTheme}.svg`;
  // }, [resolvedTheme]);

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <main>{children}</main>
      <Footer />
    </div>
  );
};
