import React from "react";

const Footer = () => {
  return (
    <footer className="flex justify-between mt-8 md:mt-20 px-4 md:px-20 py-8">
      <span>&copy; {new Date().getFullYear()} Reti Fier</span>
    </footer>
  );
};

export { Footer };
