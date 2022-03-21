import React, { useEffect, useState } from "react";

import { ThemeToggle } from "../ThemeToggle";

const Header = () => {
  return (
    <>
      <header className="relative z-50 px-4 lg:px-20 py-8">
        <div className="flex justify-between items-center">
          <div className="group relative transition whitespace-nowrap hover:transition duration-300 text-2xl font-bold">
            <span className="absolute transition duration-300 left-0 opacity-0 group-hover:opacity-100 text-transparent bg-clip-text bg-gradient-to-r from-blue-start to-blue-stop dark:from-gray-300   dark:to-indigo-900">
              Reti Fier
            </span>
            <span className="transition duration-300 opacity-100 group-hover:opacity-0  ">
              @retifier
            </span>
          </div>

          <div className="hidden md:block justify-items-end">
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
};

export { Header };
