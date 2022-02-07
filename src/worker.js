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
const generateCodeFrame = require("vue-template-compiler").generateCodeFrame;

// We use our own versions of compileToDescriptor until this PR is merged:
// https://github.com/vuejs/vue-component-compiler/pull/122
const {
  compileToDescriptor,
  compileToDescriptorAsync,
} = require("./compiler.js");

module.exports = async ({
  filename,
  source,
  extractCss,
  production,
  postcssPlugins,
  isAsync,
  assembleOptions,
}) => {
  const compilerOptions = {
    template: {
      isProduction: production,
      compilerOptions: { outputSourceRange: true },
    },
    style: {
      postcssPlugins,
    },
  };
  const compiler = componentCompiler.createDefaultCompiler(compilerOptions);
  usedFiles = new Set();
  try {
    if (/^\s*$/.test(source)) {
      throw new Error("File is empty");
    }
    const result = isAsync
      ? await compileToDescriptorAsync.call(compiler, filename, source)
      : compileToDescriptor.call(compiler, filename, source);
    let styles;

    const resultErrors = getErrors(result);
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

    const { code } = componentCompiler.assemble(
      compiler,
      filename,
      result,
      assembleOptions
    );

    return {
      code,
      styles,
      usedFiles,
      loader: result.script ? result.script.lang : undefined,
    };
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

function getErrors(result) {
  let errors = [];
  if (result.template && result.template.errors) {
    errors = errors.concat(getTemplateErrors(result.template));
  }
  if (result.styles) {
    errors = errors.concat(combineErrors(result.styles));
  }
  return errors;
}

function getTemplateErrors(template) {
  if (!template.errors) {
    return [];
  }
  return template.errors.map((e) => ({
    text: e.msg + "\n\n" + generateCodeFrame(template.source, e.start, e.end),
    detail: e,
  }));
}

function combineErrors(outputs) {
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
    return { text: e.message, detail: e };
  }
  throw new Error(`Cannot convert Vue compiler error: ${e}`);
}

function editModule(name, fn) {
  fn(require(name));
}
