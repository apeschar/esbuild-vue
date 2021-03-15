# esbuild-vue

This plugin lets you import [Vue single-file components][sfc] when bundling with [esbuild]. This plugin works with Vue 2.

## Getting started

In order to use esbuild plugins, you must use esbuild's JavaScript API, instead of the command line.

Let's assume you have a `Component.vue`, and a `main.js` that uses it somehow:

~~~
# Component.vue
<template>
    <h1>Hello, World!</h1>
</template>
~~~

~~~
# main.js
import Component from './Component.vue';
import Vue from 'vue';

new Vue({
    el: '#app',
    render: h => h(Component),
});
~~~

First, install the plugin, esbuild and Vue:

~~~
yarn add esbuild-vue esbuild vue
~~~

Next, create a build script `build.js`:

~~~
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
~~~

Then run it:

~~~
node build.js
~~~

Now, loading `index.html` should display your component in its full glory.

~~~
<!-- index.html -->
<!doctype html>
<div id="app"></div>
<script src="out.js"></script>
~~~

[sfc]: https://vuejs.org/v2/guide/single-file-components.html
[esbuild]: https://esbuild.github.io/