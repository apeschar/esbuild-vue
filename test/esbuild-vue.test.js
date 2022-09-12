/* eslint-env jest */

test("expects importing Vue SFC to work", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/main.js"],
    plugins: [require("../src/index.js")()],
    write: false,
  });

  expect(result.outputFiles).toHaveLength(1);

  const src = String.fromCodePoint(...result.outputFiles[0].contents);
  expect(src).toContain("Hello, World!");
  expect(src).toContain('__file = "test/input/MyComponent.vue"');
});

test("expects to allow custom normalizer", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    format: "esm",
    external: ["custom-normalizer"],
    entryPoints: ["test/input/main.js"],
    plugins: [
      require("../src/index.js")({
        assembleOptions: { normalizer: "~custom-normalizer" },
      }),
    ],
    write: false,
  });

  expect(result.outputFiles).toHaveLength(1);

  const src = String.fromCodePoint(...result.outputFiles[0].contents);
  expect(src).toContain('import __vue_normalize__ from "custom-normalizer"');
  expect(src).toContain("Hello, World!");
});

test("expects CSS to be extracted", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/main-styles.js"],
    plugins: [require("../src/index.js")({ extractCss: true })],
    outdir: "test/output",
    write: false,
  });

  const css = String.fromCodePoint(...result.outputFiles[1].contents);

  expect(result.outputFiles).toHaveLength(2);
  expect(result.outputFiles[1].path).toMatch(/[/\\]main-styles\.css$/);
  expect(css).toContain("body {");
  expect(css).toContain(".MyComponent[data-v-");
  expect(css).toContain(".Hello[data-v-");
});

test("expects relative URLs in extracted CSS to be resolved", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/RelativeUrl.vue"],
    plugins: [
      require("../src/index.js")({
        extractCss: true,
      }),
    ],
    write: false,
    loader: { ".jpg": "dataurl" },
    outdir: "test/output",
  });

  expect(result.outputFiles).toHaveLength(2);

  expect(result.outputFiles[1].path).toMatch(/\.css$/);
  const css = String.fromCodePoint(...result.outputFiles[1].contents);
  expect(css).toContain("data:");
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
  ).rejects.toThrow(/has no matching end tag[\s\S]*<script>/);
});

test("expects building without threads to work", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/main.js"],
    plugins: [require("../src/index.js")({ workers: false })],
    write: false,
  });

  expect(result.outputFiles).toHaveLength(1);
});

test("expects building empty components to work", async () => {
  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/Empty.vue"],
    plugins: [require("../src/index.js")({ workers: false })],
    write: false,
  });

  expect(result.outputFiles).toHaveLength(1);
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
      logLevel: "silent",
    })
  ).rejects.toThrow(/Could not compile.*File is empty/);
});

test("expects using PostCSS plugins to work", async () => {
  const url = require("postcss-url");

  const result = await require("esbuild").build({
    bundle: true,
    entryPoints: ["test/input/RelativeUrl.vue"],
    plugins: [
      require("../src/index.js")({
        postcssPlugins: [
          url({
            url: (asset) => {
              return new URL(
                asset.url,
                new URL("http://my-root-url/")
              ).toString();
            },
          }),
        ],
        isAsync: true,
      }),
    ],
    write: false,
  });

  expect(result.outputFiles).toHaveLength(1);
  expect(String.fromCodePoint(...result.outputFiles[0].contents)).toContain(
    "url(http://my-root-url/some-file.jpg)"
  );
});

test("expects TypeScript to be properly loaded", async () => {
  const result = await require("esbuild").build({
    entryPoints: ["test/input/TypeScript.vue"],
    plugins: [require("../src/index.js")()],
    write: false,
  });

  expect(result.outputFiles).toHaveLength(1);
  expect(String.fromCodePoint(...result.outputFiles[0].contents)).toMatch(
    /function\s+test\(\)\s*{/
  );
});

test("expects comments in strings not to be removed", async () => {
  await require("esbuild").build({
    entryPoints: ["test/input/CommentInString.vue"],
    plugins: [require("../src/index.js")()],
    write: false,
  });
});
