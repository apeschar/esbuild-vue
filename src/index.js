const { resolve, relative } = require("path");
const fs = require("fs");

module.exports = function ({
  workers = true,
  extractCss = false,
  production = process.env.NODE_ENV === "production",
  onReadFile,
} = {}) {
  let runTask;

  if (!workers) {
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
        let { code, styles, errors, usedFiles } = await runTask({
          filename,
          source,
          extractCss,
          production,
        });

        if (extractCss && Array.isArray(styles) && styles.length) {
          const cssPath = filename
            .replace(".vue", ".esbuild-vue-css")
            .replace(/\\/g, "/");
          cssCode.set(
            cssPath,
            styles.reduce((str, { code }) => str + code, "")
          );
          code += `\nimport ${JSON.stringify(cssPath)};`;
        }

        for (const file of usedFiles) {
          if (onReadFile) {
            await onReadFile(file);
          }
        }
        if (errors && errors.length > 0) {
          return {
            errors,
          };
        }
        return {
          contents: code,
        };
      });

      //if the css exists in our map, then output it with the css loader
      build.onResolve({ filter: /\.esbuild-vue-css$/ }, ({ path }) => {
        return { path, namespace: "vuecss" };
      });

      build.onLoad(
        { filter: /\.esbuild-vue-css$/, namespace: "vuecss" },
        ({ path }) => {
          const css = cssCode.get(path);
          return css ? { contents: css, loader: "css" } : null;
        }
      );
    },
  };
};
