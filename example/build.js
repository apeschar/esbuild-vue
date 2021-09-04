(async function () {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["src/main.js"],
    format: "esm",
    splitting: true,
    minify: true,
    external: ["vue"],
    plugins: [
      require("../src/index.js")({ extractCss: true, production: true }),
    ],
    outdir: "dist",
  });
})();
