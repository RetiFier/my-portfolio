module.exports = async ({ actions }, options) => {
  const basePath = options.basePath || "/";

  actions.createPage({
    path: basePath,
    component: require.resolve("../../pages/index.tsx"),
  });
};
