/** Downloadable résumé: named after its owner so a saved file is easy to find. */
export const RESUME_FILE = "Reti-Fier-Resume.pdf";
export const RESUME_PDF = `/${RESUME_FILE}`;

/** Download the PDF with its proper file name (also from places that are not links). */
export const downloadResume = () => {
  const a = document.createElement("a");
  a.href = RESUME_PDF;
  a.download = RESUME_FILE;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
