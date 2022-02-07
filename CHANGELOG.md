# Change log

## 1.2.1 - 2022-02-07

- Remove use of optional chaining operator in order to support Node.js 12.

## 1.2.0 - 2022-02-04

- Add support for `assembleOptions`.

## 1.1.2 - 2022-01-11

- Cause `component.__file` to contain the filename of the `*.vue` file, instead
  of its contents.

## 1.1.1 - 2022-01-10

- Don't strip comments from `<script>` contents. This will cause errors when you
  have `export default` in a comment, but this needs to be fixed in the Vue
  compiler.

## 1.1.0 - 2022-01-04

- Add support for TypeScript via `<script lang="ts">`.
- Strip comments from `<script>` contents to prevent commented `export default`
  declaration from triggering errors.

## 1.0.0 - 2021-11-25

- Add support for PostCSS plugins.

## 0.4.1 - 2021-11-23

- Output a code fragment for template errors.

## 0.4.0 - 2021-09-07

- Add `extractCss` to allow generating a separate CSS file instead of inlining
  styles in the generated JavaScript.

## 0.3.3 - 2021-06-14

- `vue-template-compiler` is now a peer dependency to avoid version conflicts
  with Vue.

## 0.3.2 - 2021-06-08

- Correctly propagate Vue component compiler exceptions to esbuild log.
- Detect empty input files so we get a clearer error message.

## 0.3.1 - 2021-05-18

- Add `onReadFile` for tracking dependencies.

## 0.3.0 - 2021-03-23

- Fail build when `<style>` element contains errors.
- Allow building components without a `<template>` element.

## 0.2.0 - 2021-03-15

- Parallelize compilation via `worker_thread`.

## 0.1.0 - 2021-03-15

- Initial release.
