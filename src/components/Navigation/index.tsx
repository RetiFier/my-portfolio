import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import { AnimatePresence, motion } from "framer-motion";
import { navSections } from "../../theme/navSections";
import { useActiveSection } from "../../hooks/useActiveSection";
import { openCommandPalette } from "../CommandPalette";
import { useShortcutLabel } from "../../hooks/useShortcutLabel";

interface NavigationProps {
  /** True on the home page, where links scroll in-page and scroll-spy runs. */
  isHome: boolean;
  name: string;
}

export const Navigation: React.FC<NavigationProps> = ({ isHome, name }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(isHome);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const shortcut = useShortcutLabel();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <>
    <header
      className={`no-print fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? "border-b border-line bg-canvas/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="container-site flex h-16 items-center justify-between md:h-[4.5rem]">
        <Link to="/" className="tap group flex items-baseline gap-3" aria-label={`${name}, home`}>
          <span className="display text-[1.05rem] tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">{name}</span>
          <span className="hidden font-mono text-label uppercase tracking-[0.05em] text-faint lg:inline">/ full-stack product engineer</span>
        </Link>

        <ul className="hidden items-center gap-1.5 md:flex">
          {navSections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={href(s.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`tag py-2 transition-colors duration-200 xl:py-1 ${isActive ? "tag-solid" : "hover:border-ink/60 hover:text-ink"}`}
                >
                  <span aria-hidden="true" className={isActive ? "text-canvas/60" : "text-faint"}>
                    /
                  </span>
                  {s.label}
                </a>
              </li>
            );
          })}
          <li className="ml-2">
            <Link to="/resume/" className="tag py-2 text-ink transition-colors xl:py-1 hover:border-accent hover:text-accent">
              Résumé
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Open command menu"
              className="tag py-2 transition-colors xl:py-1 hover:border-accent hover:text-accent"
            >
              <span aria-hidden="true">{shortcut}</span>
            </button>
          </li>
        </ul>

        <div className="flex items-center gap-1 md:hidden">
        <button
          type="button"
          onClick={openCommandPalette}
          aria-label="Open command menu"
          className="tag h-9"
        >
          <span aria-hidden="true">&gt;_</span>
        </button>
        <button
          ref={menuButtonRef}
          type="button"
          className="relative -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`absolute h-px w-6 bg-ink transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[4px]"}`}
          />
          <span
            className={`absolute h-px w-6 bg-ink transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[4px]"}`}
          />
        </button>
        </div>
      </nav>
    </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become
          the containing block for this fixed overlay. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="no-print fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-canvas md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.ul
              className="container-site flex flex-col pt-6"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {[...navSections, { id: "resume", label: "Résumé" }].map((s, i) => (
                <motion.li
                  key={s.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                  className="border-b border-line"
                >
                  {s.id === "resume" ? (
                    <Link
                      to="/resume/"
                      onClick={() => setOpen(false)}
                      className="display flex items-baseline justify-between py-5 text-3xl text-ink"
                    >
                      {s.label}
                      <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                    </Link>
                  ) : (
                    <a
                      href={href(s.id)}
                      onClick={() => setOpen(false)}
                      className="display flex items-baseline justify-between py-5 text-3xl text-ink"
                    >
                      {s.label}
                      <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                    </a>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
