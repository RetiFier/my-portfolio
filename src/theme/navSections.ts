/** Home-page sections shown in the navigation (ids must match section ids). */
export const navSections = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export type NavSectionId = (typeof navSections)[number]["id"];
