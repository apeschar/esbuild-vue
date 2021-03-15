import vuePlugin from "../src/index.js";
import esbuild from "esbuild";
import { dirname, resolve } from "path";

const root = dirname(__filename);

test("expects importing Vue SFC to work", () => {
  esbuild.build({
    entryPoints: resolve(root, "inputs/main.js"),
  });
});
