const fs = require("fs");
const path = require("path");

/**
 * The résumé PDF is published as /Reti-Fier-Resume.pdf. Older links (LinkedIn,
 * shared URLs) point at /resume.pdf, so keep a copy there.
 */
module.exports = ({ reporter }) => {
  const from = path.join(process.cwd(), "public", "Reti-Fier-Resume.pdf");
  const to = path.join(process.cwd(), "public", "resume.pdf");
  if (!fs.existsSync(from)) {
    reporter.warn("Reti-Fier-Resume.pdf not found in public/; /resume.pdf was not created");
    return;
  }
  fs.copyFileSync(from, to);
};
