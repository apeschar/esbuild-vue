const componentCompiler = require("@vue/component-compiler");

module.exports = async ({ filename, source }) => {
  const compiler = componentCompiler.createDefaultCompiler();
  const result = compiler.compileToDescriptor(filename, source);
  const resultErrors = combineErrors(result.template, ...result.styles);
  if (resultErrors.length > 0) {
    return { errors: resultErrors };
  }
  const output = componentCompiler.assemble(compiler, source, result, {});
  return { contents: output.code };
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
