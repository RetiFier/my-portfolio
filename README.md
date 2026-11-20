# Reti Fier — Portfolio

Personal portfolio of Reti Fier, full-stack software engineer. Live at
[retifier.dev](https://retifier.dev).

Built with Gatsby 5, React 18, TypeScript, Tailwind CSS and Framer Motion.
Professional content (experience, projects, case studies, profile, skills) lives in YAML under `content/`; components hold only section headings and interface copy.

## Development

```bash
npm install
npm run develop      # http://localhost:8000
npm run typecheck    # tsc --noEmit
npm run build        # production build into public/
npm run serve        # serve the production build on :9000
```

## Content

| File | What it controls |
| --- | --- |
| `content/profile.yaml` | Name, title, hero intro, About paragraphs, "How I work" principles, capability groups, résumé summary |
| `content/job.yaml` | Experience timeline and résumé experience |
| `content/project.yaml` | Featured, selected and archived projects, plus case studies |
| `content/social.yaml` | LinkedIn / GitHub links (also used for structured data) |
| `content/images/` | Company logos and project screenshots |

The GraphQL schema for these files is declared explicitly in
`src/gatsby/node/createSchemaCustomization.js`, so optional fields can be left
out of any entry.

### Adding a role

Add an entry to `content/job.yaml`:

```yaml
- order: 1                 # lower = higher on the page; renumber others
  company:
    name: Company
    url: https://example.com   # optional
    logo: images/company.png   # optional
  jobTitle: Senior Engineer
  employmentType: Full-time
  workplace: Remote            # optional
  fromDate: "2027-02"          # ISO year-month
  current: true                # or set toDate: "2028-01"
  summary: One or two sentences.
  highlights:
    - What you were responsible for.
  technologies: [TypeScript, Node.js]
```

Leaving out both `toDate` and `current` renders "Started <month>" for roles
without a confirmed end date.

### Adding a project or case study

Add an entry to `content/project.yaml` with `tier: featured | selected | archive`.
Featured projects that include a `caseStudy` block automatically get a page at
`/work/<slug>/` (generated in `src/gatsby/node/createPages.js`). The
architecture diagram on that page is drawn from `caseStudy.architecture`.
Only link repositories that are public.

## Résumé

`/resume/` renders the résumé from the same YAML and is designed to print on
A4. It includes a career-span strip and a small per-role track beside each
date range, both built from the role dates. On screen it also has count-up
figures, scroll reveal, a contents rail with reading progress (wide screens),
an "in view" panel whose start year rolls as you read, a stack filter
(technology counts from `job.yaml` and the listed projects; selecting one
highlights where it was used) and a "copy as plain text" action. These are
screen-only and never affect the printout, the copied text or the PDF.

After changing experience, regenerate the downloadable PDF (`static/Reti-Fier-Resume.pdf`; the build also copies it to `/resume.pdf` for older links) (keep it to two
pages). Use an absolute output path: a relative one can silently write
nothing, so check the file's modified time afterwards:

```bash
npm run build && npm run serve
# in another terminal (Chrome on Windows shown; any Chromium works):
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --no-pdf-header-footer "--print-to-pdf=D:\Development\my-portfolio\static\Reti-Fier-Resume.pdf" http://localhost:9000/resume/
```

`static/og-image.png` is the 1200×630 social preview image.

## Structure

```
src/
  components/
    home/        Hero, FeaturedWork, MoreProjects, Experience, CareerTimeline, About, Recovery (+ recoverySequence.ts), Skills, Contact
    motion/      SystemField (3D hero canvas: Canvas 2D perspective, drag to orbit), YearOdometer, SplitText, ScrambleText, Typer, CountUp, Wipe, NextSection, Marquee
    visuals/     DecisionTrace, ArchitectureDiagram, BrowserFrame
    ui/          Reveal, SectionHeader, TechList, ArrowLink
    CommandPalette/  Explore/  Toaster/  Hud/  Navigation/  Footer/  ScrollProgress/  Seo/  Layout.tsx
  pages/         index, resume, 404
  templates/     case-study.tsx
  utils/         dates.ts (ISO month helpers), animations.ts, goToSection.ts
  hooks/         useSiteData.ts, useExplore.ts (visitor progress store)
```

In `gatsby develop` the custom 404 also shows for unknown URLs (a dev-only
catch-all page created in `src/gatsby/node/createPages.js`), instead of
Gatsby's development 404 list. The 404 page is a small terminal: it shows the request that missed,
suggests the closest real routes (from the built site) and supports `help`,
`ls`, `open <path>`, `whoami`, `resume [--pdf]`, `contact` and `home`, with tab
completion and history.

Press `/` or `Ctrl K` / `⌘K` for the command menu (sections, case studies,
résumé, copy email). Single-key controls: `J`/`K` next and previous
section, `1`–`5` jump, `M` page map, `?` controls and progress; they can be
switched off from the Explore panel. The Explore panel tracks sections visited,
case studies read and trophies for using these controls. Progress lives in the
visitor's localStorage (`rf.explore.v1`) only. Readouts on the page (build date, FPS, section index,
scroll %, counts) come from real data only.

Experience shows the start year of the role being read as rolling digits.
Capabilities pins on tall desktop screens (lg and at least 800px high) and
steps through each group with a progress tab bar and a hub diagram drawn from
the group's `items`; shorter or narrower screens get the tabbed or stacked
layout. The "Recovery" section turns the "Own it in production" principle into
an incident simulator: trigger kill -9, out of memory or a bad deploy and
watch detection, restart or rollback, state restore and readiness, with logs,
simulated traffic and an incident report. "View source" shows
`recoverySequence.ts` verbatim (imported with `?raw`, configured in
`src/gatsby/node/onCreateWebpackConfig.js`).

Animated headings (SplitText, ScrambleText, Typer, YearOdometer, the Recovery
heading) keep their real text once, in an sr-only span, and draw the moving
letters from `data-g` attributes (`.glyph` in `global.css`). Search engines,
copy-paste and screen readers get one clean heading instead of "TitleTitle".
Inner pages add BreadcrumbList structured data; the home page adds Person and
WebSite.

There is no service worker. `gatsby-plugin-offline` was removed because it
served stale builds after deploys; `static/sw.js` is a kill switch that clears
its caches and unregisters it for returning visitors, and `gatsby-browser.js`
does the same on page load. Keep `static/sw.js` deployed for a few months.

Motion respects `prefers-reduced-motion` (Framer Motion via `MotionConfig`,
CSS animations via a media query). Above-the-fold content uses CSS
animations so it renders without waiting for JavaScript.
