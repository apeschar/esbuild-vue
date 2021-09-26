let usedFiles;
let requireDepth = 0;

editModule("module", (mdl) => {
  mdl.prototype.require = new Proxy(mdl.prototype.require, {
    apply(target, thisArg, args) {
      requireDepth++;
      try {
        return Reflect.apply(target, thisArg, args);
      } finally {
        requireDepth--;
      }
    },
  });
});

editModule("fs", (fs) => {
  fs.readFileSync = new Proxy(fs.readFileSync, {
    apply(target, thisArg, args) {
      if (usedFiles && requireDepth === 0) usedFiles.add(args[0]);
      return Reflect.apply(target, thisArg, args);
    },
  });
});

const componentCompiler = require("@vue/component-compiler");
const { parse } = require("@vue/component-compiler-utils");
const strip = require("strip-comments");

module.exports = async ({
  filename,
  source,
  trackUsedFiles,
  extractCss,
  production,
}) => {
  const compilerOptions = production
    ? { template: { isProduction: true } }
    : {};
  const compiler = componentCompiler.createDefaultCompiler(compilerOptions);
  usedFiles = new Set();
  try {
    if (/^\s*$/.test(source)) {
      throw new Error("File is empty");
    }
    const result = compiler.compileToDescriptor(filename, source);
    let styles;
    const { script } = parse({
      source,
      filename,
      needMap: true,
      compiler: require("vue-template-compiler"),
    });
    result.script.code = strip(result.script.code);
    const scriptLoader = (script.attrs && script.attrs.lang) || "js";
    const resultErrors = combineErrors(result.template, ...result.styles);
    if (resultErrors.length > 0) {
      return { errors: resultErrors, usedFiles };
    }

    if (extractCss) {
      styles = result.styles.map(({ code }) => ({ code }));
      // Remove the style code to prevent it from being injected
      // in the JS bundle, but keep it as reference to preserve scopeId value.
      for (const style of result.styles) {
        style.code = "";
      }
    }

    const { code } = componentCompiler.assemble(compiler, source, result, {});
    return { code, styles, usedFiles, scriptLoader };
  } catch (e) {
    return {
      errors: [
        {
          text: `Could not compile Vue single-file component: ${e}`,
          detail: e,
        },
      ],
      usedFiles,
    };
  }
};

function combineErrors(...outputs) {
  return outputs
    .map((o) => {
      if (!o || !o.errors) {
        return [];
      }
      return o.errors.map((e) => convertError(e));
    })
    .flat();
}

function convertError(e) {
  if (typeof e === "string") {
    return { text: e };
  }
  if (e instanceof Error) {
    return { text: e.message };
  }
  throw new Error(`Cannot convert Vue compiler error: ${e}`);
}

function editModule(name, fn) {
  fn(require(name));
}
