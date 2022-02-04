const { resolve, relative } = require("path");
const fs = require("fs");
const escapeRegExp = require("lodash.escaperegexp");

const EXTRACT_CSS_NAMESPACE = "esbuild-vue-css";
const EXTRACT_CSS_SUFFIX = "?" + EXTRACT_CSS_NAMESPACE;
const EXTRACT_CSS_REGEXP = new RegExp(`${escapeRegExp(EXTRACT_CSS_SUFFIX)}$`);

module.exports = function ({
  workers = true,
  extractCss = false,
  production = process.env.NODE_ENV === "production",
  onReadFile,
  postcssPlugins = [],
  isAsync = false,
  assembleOptions = {},
} = {}) {
  let runTask;

  if (!workers || postcssPlugins.length > 0) {
    runTask = require("./worker.js");
  } else {
    const piscina = new (require("piscina"))({
      filename: resolve(__dirname, "worker.js"),
      maxThreads:
        typeof workers == "number"
          ? workers
          : Math.min(4, require("os").cpus().length),
    });
    runTask = (data) => piscina.runTask(data);
  }

  return {
    name: "vue",
    setup(build) {
      const cssCode = new Map();

      build.onLoad({ filter: /[^/]\.vue$/ }, async ({ path }) => {
        const filename = relative(process.cwd(), path);
        const source = await fs.promises.readFile(path, "utf8");

        let { code, styles, errors, usedFiles, loader } = await runTask({
          filename,
          source,
          extractCss,
          production,
          postcssPlugins,
          isAsync,
          assembleOptions,
        });

        if (extractCss && styles && styles.length) {
          const cssPath = filename + EXTRACT_CSS_SUFFIX;
          cssCode.set(
            cssPath,
            styles.reduce((str, { code }) => str + code, "")
          );
          code += `\nimport ${JSON.stringify(cssPath)};`;
        }

        if (onReadFile) {
          for (const file of usedFiles) {
            await onReadFile(file);
          }
        }

        if (errors && errors.length) {
          return { errors };
        }

        return { contents: code, loader };
      });

      if (extractCss) {
        build.onResolve({ filter: EXTRACT_CSS_REGEXP }, ({ path }) => {
          return { path, namespace: EXTRACT_CSS_NAMESPACE };
        });

        build.onLoad(
          { filter: EXTRACT_CSS_REGEXP, namespace: EXTRACT_CSS_NAMESPACE },
          ({ path }) => {
            const css = cssCode.get(path);
            if (!css) {
              return null;
            }
            return { contents: css, loader: "css" };
          }
        );
      }
    },
  };
};
