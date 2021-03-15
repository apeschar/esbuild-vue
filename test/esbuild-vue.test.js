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
