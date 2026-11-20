import React from "react";

const DIGITS = "0123456789";

interface YearOdometerProps {
  /** Digits to show, e.g. "2024". Non-digit characters render as static text. */
  value: string;
  className?: string;
  /** Per-column stagger in ms, rightmost column first. */
  stagger?: number;
  /** false jumps to the value without rolling (used to set a starting value). */
  animate?: boolean;
}

/**
 * Rolling digits: each column is a 0-9 strip translated to the current digit,
 * so changing the value rolls the columns that differ. The real value is in
 * the HTML as text for assistive tech and no-JS readers; the strips are
 * decorative. The transition is CSS, so prefers-reduced-motion (global rule)
 * turns it into an instant change.
 */
export const YearOdometer: React.FC<YearOdometerProps> = ({ value, className = "", stagger = 70, animate = true }) => {
  const chars = value.split("");
  return (
    <span className={`relative inline-flex leading-none ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((ch, i) => {
          const d = DIGITS.indexOf(ch);
          if (d === -1) {
            return (
              <span key={i} className="glyph inline-block" data-g={ch} />
            );
          }
          const delay = (chars.length - 1 - i) * stagger;
          return (
            <span key={i} className="relative inline-block h-[1em] overflow-hidden tabular-nums">
              {/* Width holder so the column sizes to its digit glyph */}
              <span className="glyph invisible block" data-g="0" />
              <span
                className={`absolute inset-x-0 top-0 flex flex-col ${
                  animate ? "transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]" : ""
                }`}
                style={{ transform: `translateY(${-d}em)`, transitionDelay: `${delay}ms` }}
              >
                {DIGITS.split("").map((n) => (
                  <span key={n} className="glyph block h-[1em] text-center" data-g={n} />
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
};
