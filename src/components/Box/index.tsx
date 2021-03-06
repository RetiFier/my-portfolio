import React, { FC } from "react";

export const Box: FC = ({ children }) => {
  return (
    <div className="md:w-10/12 px-8 py-6 rounded-3xl glass-light dark:glass-dark mb-6 drop-shadow-lg hover:drop-shadow-2xl  transition-all">
      {children}
    </div>
  );
};
