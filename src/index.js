import path from "path";
import componentCompiler from "@vue/component-compiler";

export default function () {
  return {
    name: "vue",
    setup(build) {
      const compiler = compiler.createDefaultCompiler();

      build.onLoad({ filter: /[^/]\.vue$/ }, async (args) => {
        const source = await fs.promises.readFile(args.path, "utf8");
        const filename = path.relative(process.cwd(), args.path);
        const result = compiler.compileToDescriptor(filename, source);
        if (result.template.errors.length > 0) {
          return {
            errors: result.template.errors.map((text) => ({
              text,
            })),
          };
        }
        const output = compiler.assemble(comp, filename, result, {});
        return { contents: output.code };
      });
    },
  };
}
