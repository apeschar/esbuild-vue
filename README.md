# esbuild-vue

This plugin lets you import [Vue single-file components][sfc] when bundling with [esbuild]. This plugin works with Vue 2.

Multiple Vue imports are built in parallel using Node.js' worker_threads via [Piscina].

## Installation

```
yarn add esbuild-vue
```

## Getting started

In order to use esbuild plugins, you must use esbuild's JavaScript API, instead of the command line.

Let's assume you have a `Component.vue`, and a `main.js` that uses it somehow:

```
# Component.vue
<template>
    <h1>Hello, World!</h1>
</template>
```

```
# main.js
import Component from './Component.vue';
import Vue from 'vue';

new Vue({
    el: '#app',
    render: h => h(Component),
});
```

First, install the plugin, esbuild and Vue:

```
yarn add esbuild-vue esbuild vue
```

Next, create a build script `build.js`:

```
const vuePlugin = require('esbuild-vue');

require('esbuild').build({
    entryPoints: ['main.js'],
    bundle: true,
    outfile: 'out.js',
    plugins: [vuePlugin()],
    define: {
        "process.env.NODE_ENV": JSON.stringify("development"),
    },
});
```

Then run it:

```
node build.js
```

Now, loading `index.html` should display your component in its full glory.

```
<!-- index.html -->
<!doctype html>
<div id="app"></div>
<script src="out.js"></script>
```

## Configuration

An object containing configuration options may be passed into the plugin constructor `vuePlugin`. For example:

```
vuePlugin({
    extractCss: true,
    workers: false,
    onReadFile: path => {
        console.error("The following dependency was used:", path);
    }
})
```

The following options are available:

- `extractCss`: Output a separate file for inline `<style>` blocks in single-file components.
- `workers`: The maximum amount of worker threads to use for compilation. By default this is 4 or the amount of CPUs available, whichever is least. (During my testing, larger amounts of threads don't provide a performance improvement.) Use `false` to disable multithreading.
- `onReadFile`: Will be called with the (non-normalized) paths of every file read during the compilation process. For example, external files included using `@import` declarations in `<style>` blocks.
- `postcssPlugins`: PostCSS plugins which will be used when compiling `<style>` blocks in components.
- `isAsync`: By default, components are compiled using the synchronous (non-async) compiler. If you use async PostCSS plugins, you need to specify `true` here.
- `assembleOptions`: Allows to provide custom `normalizer`, `styleInjector` and `styleInjectorSSR` implementations ([upstream docs][vcc]).

[sfc]: https://vuejs.org/v2/guide/single-file-components.html
[esbuild]: https://esbuild.github.io/
[piscina]: https://www.npmjs.com/package/piscina
[vcc]: https://github.com/vuejs/vue-component-compiler/tree/v4.2.4#handling-the-output
