import React from 'react';
import { FiMail } from 'react-icons/fi';
import { ProfileType, SocialType } from '../../@types/about';
import { getSocialIcon } from '../../utils/socialIcons';

interface FooterProps {
  social: SocialType[];
  profile: ProfileType;
}

export const Footer: React.FC<FooterProps> = ({ social, profile }) => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-8 sm:py-12 bg-[#141416] border-t border-[#1e1e1e] text-xs text-[#6b7280]"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; 2022-{year} {profile.fname} {profile.lname}</p>

        <div className="flex items-center gap-6">
          {social.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6b7280] hover:text-white transition-colors"
              aria-label={link.name}
            >
              {getSocialIcon(link.name, 'w-4 h-4')}
            </a>
          ))}

          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="text-[#6b7280] hover:text-white transition-colors"
              aria-label="Email"
            >
              <FiMail className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};
