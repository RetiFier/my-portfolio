/**
 * `import source from "./file.ts?raw"` returns the file's text, untouched.
 * Used by the recovery demo to show the code that is actually running it.
 * Script rules skip `?raw` requests so Babel does not transform the text first.
 */
const isScriptRule = (rule) =>
  rule && rule.test instanceof RegExp && ["x.js", "x.ts", "x.tsx"].some((f) => rule.test.test(f));

module.exports = ({ getConfig, actions }) => {
  const config = getConfig();
  config.module.rules = config.module.rules.map((rule) =>
    isScriptRule(rule) && !rule.resourceQuery ? { ...rule, resourceQuery: { not: [/raw/] } } : rule,
  );
  config.module.rules.push({ resourceQuery: /raw/, type: "asset/source" });
  actions.replaceWebpackConfig(config);
};
