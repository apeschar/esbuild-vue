test("expects importing Vue SFC to work", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/main.js"],
    plugins: [require("../src/index.js")()],
    write: false
  });

  expect(result.outputFiles).toHaveLength(1);
  expect(String.fromCodePoint(...result.outputFiles[0].contents)).toContain(
    "Hello, World!"
  );
});

test("expects importing SFCs with syntax errors to fail", async () => {
  await expect(
    require("esbuild").build({
      bundle: true,
      entryPoints: ["test/input/BrokenComponent.vue"],
      plugins: [require("../src/index.js")()],
      write: false,
      logLevel: "silent"
    })
  ).rejects.toThrow(/has no matching end tag/);
});

test("expects building without threads to work", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/main.js"],
    plugins: [require("../src/index.js")({ workers: false })],
    write: false
  });
});
