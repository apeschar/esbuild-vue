test("expects importing Vue SFC to work", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/main.js"],
    plugins: [require("../src/index.js")()],
    write: false,
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
      logLevel: "silent",
    })
  ).rejects.toThrow(/has no matching end tag/);
});

test("expects building without threads to work", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/main.js"],
    plugins: [require("../src/index.js")({ workers: false })],
    write: false,
  });
});

test("expects building empty components to work", async () => {
  await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/Empty.vue"],
    plugins: [require("../src/index.js")({ workers: false })],
    write: false,
  });
});

test("expects style errors to be propagated", async () => {
  await expect(
    require("esbuild").build({
      bundle: true,
      entryPoints: ["test/input/StyleErrors.vue"],
      plugins: [require("../src/index.js")({ workers: false })],
      write: false,
      logLevel: "silent",
    })
  ).rejects.toThrow(/Expected string/);
});

test("expects used files to be tracked", async () => {
  const files = [];

  await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/StyleImport.vue"],
    plugins: [
      require("../src/index.js")({
        onReadFile: (f) => files.push(f),
      }),
    ],
    write: false,
  });

  expect(files).toHaveLength(1);
});

test("expects empty file to cause error", async () => {
  await expect(
    require("esbuild").build({
      bundle: true,
      entryPoints: ["test/input/EmptyFile.vue"],
      plugins: [require("../src/index.js")({ workers: false })],
      write: false,
    })
  ).rejects.toThrow(/Could not compile.*File is empty/);
});
