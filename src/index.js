const path = require("path");
const fs = require("fs");

module.exports = function({ workers = true } = {}) {
  let runTask;

  if (!workers) {
    runTask = require("./worker.js");
  } else {
    const piscina = new (require("piscina"))({
      filename: path.resolve(__dirname, "worker.js"),
      maxThreads:
        typeof workers == "number"
          ? workers
          : Math.min(4, require("os").cpus().length)
    });
    runTask = data => piscina.runTask(data);
  }

  return {
    name: "vue",
    setup(build) {
      build.onLoad({ filter: /[^/]\.vue$/ }, async args => {
        const filename = path.relative(process.cwd(), args.path);
        const source = await fs.promises.readFile(args.path, "utf8");
        return await runTask({ filename, source });
      });
    }
  };
};
