const vuePlugin = require('esbuild-vue');
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'dist/main.js',
  plugins: [vuePlugin()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
});
