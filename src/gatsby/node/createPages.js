const path = require("path");

/**
 * Generates a technical case-study page at /work/<slug>/ for every project
 * in content/project.yaml that defines a `caseStudy` block.
 */
module.exports = async ({ graphql, actions, reporter }) => {
  const result = await graphql(`
    {
      allProjectYaml(
        filter: { caseStudy: { problem: { ne: null } } }
        sort: { order: ASC }
      ) {
        nodes {
          slug
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild("Could not load projects for case-study pages", result.errors);
    return;
  }

  const template = path.resolve("src/templates/case-study.tsx");
  const slugs = result.data.allProjectYaml.nodes.map((node) => node.slug);

  slugs.forEach((slug, index) => {
    actions.createPage({
      path: `/work/${slug}/`,
      component: template,
      context: {
        slug,
        nextSlug: slugs[(index + 1) % slugs.length],
      },
    });
  });

  // `gatsby develop` shows its own development 404 list for unknown URLs.
  // A catch-all page that renders src/pages/404.tsx makes the custom 404 show
  // there too. Created here (createPages runs on every start, cache or not),
  // development only; real pages still win because "/*" is the least specific
  // match. Production keeps the standard 404.html.
  if (process.env.gatsby_executing_command === "develop") {
    actions.createPage({
      path: "/dev-404-catch-all/",
      matchPath: "/*",
      component: path.resolve("src/pages/404.tsx"),
    });
  }
};
