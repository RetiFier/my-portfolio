import React from "react";

interface TechListProps {
  items?: string[] | null;
  className?: string;
  label?: string;
}

/** Technologies as a quiet mono list, not loud badges. */
export const TechList: React.FC<TechListProps> = ({ items, className = "", label = "Technologies" }) => {
  if (!items?.length) return null;
  return (
    <ul aria-label={label} className={`flex flex-wrap gap-x-1 gap-y-2 font-mono text-[0.8rem] text-muted ${className}`}>
      {items.map((item, i) => (
        <li key={item} className="whitespace-nowrap transition-colors duration-300 hover:text-ink">
          {item}
          {i < items.length - 1 && <span aria-hidden="true" className="ml-1 text-faint">/</span>}
        </li>
      ))}
    </ul>
  );
};
