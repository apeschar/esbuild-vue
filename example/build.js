(async function () {
  const { resolve } = require("path");
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: [resolve(__dirname, "src/main.js")],
    format: "esm",
    splitting: true,
    minify: false,
    plugins: [
      require("../src/index.js")({
        extractCss: true,
        workers: false,
        production: false,
      }),
    ],
    outdir: resolve(__dirname, "dist"),
  });
})();
