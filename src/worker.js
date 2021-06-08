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

module.exports = async ({ filename, source, trackUsedFiles }) => {
  const compiler = componentCompiler.createDefaultCompiler();
  usedFiles = new Set();
  try {
    const result = compiler.compileToDescriptor(filename, source);
    const resultErrors = combineErrors(result.template, ...result.styles);
    if (resultErrors.length > 0) {
      return { result: { errors: resultErrors }, usedFiles };
    }
    const output = componentCompiler.assemble(compiler, source, result, {});
    return { result: { contents: output.code }, usedFiles };
  } catch (e) {
    return {
      result: {
        errors: [
          {
            text: `Could not compile Vue single-file component: ${e}`,
            detail: e,
          },
        ],
      },
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
