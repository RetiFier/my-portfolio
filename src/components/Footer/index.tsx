import React from "react";
import { Link } from "gatsby";
import { useSiteData } from "../../hooks/useSiteData";
import { useShortcutLabel } from "../../hooks/useShortcutLabel";

export const Footer: React.FC = () => {
  const { fullName, profile, linkedin, github, now } = useSiteData();
  const year = now.getFullYear();
  const shortcut = useShortcutLabel();

  const links = [
    linkedin && { label: "LinkedIn", href: linkedin },
    github && { label: "GitHub", href: github },
    profile.email && { label: "Email", href: `mailto:${profile.email}` },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <footer className="no-print border-t border-line">
      <div className="container-site flex flex-col gap-6 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p>
            © {year} {fullName}. <span className="text-faint">Built with Gatsby; content lives in YAML.</span>
          </p>
          <p className="font-mono text-label uppercase tracking-[0.05em] text-faint">
            build {now.toISOString().slice(0, 10).replace(/-/g, ".")} <span className="mx-1">/</span> press{" "}
            <span className="kbd">/</span> or <span className="kbd">{shortcut}</span> for the command menu
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li>
            <Link to="/resume/" className="tap link-underline hover:text-ink">
              Résumé
            </Link>
          </li>
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="tap link-underline hover:text-ink"
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};
