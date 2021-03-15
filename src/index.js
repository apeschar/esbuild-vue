const fs = require("fs");
const path = require("path");
const componentCompiler = require("@vue/component-compiler");

module.exports = function() {
  return {
    name: "vue",
    setup(build) {
      const compiler = componentCompiler.createDefaultCompiler();

      build.onLoad({ filter: /[^/]\.vue$/ }, async args => {
        const source = await fs.promises.readFile(args.path, "utf8");
        const filename = path.relative(process.cwd(), args.path);
        const result = compiler.compileToDescriptor(filename, source);
        if (result.template.errors.length > 0) {
          return {
            errors: result.template.errors.map(text => ({
              text
            }))
          };
        }
        const output = componentCompiler.assemble(
          compiler,
          filename,
          result,
          {}
        );
        return { contents: output.code };
      });
    }
  };
};
