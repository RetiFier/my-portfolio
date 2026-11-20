import React from "react";
import { Link } from "gatsby";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";

interface ArrowLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "text";
  external?: boolean;
  download?: boolean;
  ariaLabel?: string;
}

/*
 * Square buttons. The primary one fills from the left with the accent on hover;
 * the arrow slides out and a fresh one slides in.
 */
const styles = {
  primary:
    "relative isolate inline-flex items-center gap-3 overflow-hidden border border-ink bg-ink px-5 py-3 font-mono text-small uppercase tracking-[0.06em] text-canvas transition-colors duration-300 hover:border-accent before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-accent before:transition-transform before:duration-500 before:ease-editorial hover:before:scale-x-100",
  ghost:
    "relative isolate inline-flex items-center gap-3 overflow-hidden border border-line px-5 py-3 font-mono text-small uppercase tracking-[0.06em] text-ink transition-colors duration-300 hover:border-ink hover:text-canvas before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-ink before:transition-transform before:duration-500 before:ease-editorial hover:before:scale-x-100",
  text: "inline-flex items-center gap-2 font-mono text-small uppercase tracking-[0.06em] text-ink transition-colors hover:text-accent",
};

/**
 * One link component for internal routes, in-page anchors and external URLs.
 * Internal routes use Gatsby <Link>; anchors and external URLs use <a>.
 */
export const ArrowLink: React.FC<ArrowLinkProps> = ({
  to,
  children,
  className = "",
  variant = "text",
  external,
  download,
  ariaLabel,
}) => {
  const isExternal = external ?? /^https?:\/\//.test(to);
  const isAnchorOrFile = to.startsWith("#") || to.startsWith("/#") || to.startsWith("mailto:") || download;
  const Icon = isExternal ? FiArrowUpRight : FiArrowRight;
  const content = (
    <>
      <span>{children}</span>
      <span aria-hidden="true" className="relative inline-flex h-4 w-4 shrink-0 overflow-hidden">
        <Icon className="absolute inset-0 h-4 w-4 transition-transform duration-300 group-hover:translate-x-4" />
        <Icon className="absolute inset-0 h-4 w-4 -translate-x-4 transition-transform duration-300 group-hover:translate-x-0" />
      </span>
    </>
  );
  const cls = `group ${styles[variant]} ${className}`;

  if (isExternal) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls} aria-label={ariaLabel}>
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  if (isAnchorOrFile) {
    return (
      <a href={to} className={cls} download={download || undefined} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} aria-label={ariaLabel}>
      {content}
    </Link>
  );
};
