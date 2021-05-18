const { resolve, relative } = require("path");
const fs = require("fs");

module.exports = function ({ workers = true, onReadFile } = {}) {
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
      build.onLoad({ filter: /[^/]\.vue$/ }, async ({ path }) => {
        const filename = relative(process.cwd(), path);
        const source = await fs.promises.readFile(path, "utf8");
        const { result, usedFiles } = await runTask({
          filename,
          source,
        });
        for (const file of usedFiles) {
          if (onReadFile) {
            await onReadFile(file);
          }
        }
        return result;
      });
    },
  };
};
