const componentCompiler = require("@vue/component-compiler");

module.exports = async ({ filename, source }) => {
  const compiler = componentCompiler.createDefaultCompiler();
  const result = compiler.compileToDescriptor(filename, source);
  if (result.template.errors.length > 0) {
    return {
      errors: result.template.errors.map(text => ({
        text
      }))
    };
  }
  const output = componentCompiler.assemble(compiler, source, result, {});
  return { contents: output.code };
};
