# Change log

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
