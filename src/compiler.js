const { parse } = require("@vue/component-compiler-utils");
const templateCompiler = require("vue-template-compiler");
const hash = require("hash-sum");
const path = require("path");

exports.compileToDescriptor = function (filename, source) {
  const descriptor = parse({
    source,
    filename,
    needMap: true,
    compiler: templateCompiler,
  });
  const scopeId =
    "data-v-" +
    (this.template.isProduction
      ? hash(path.basename(filename) + source)
      : hash(filename + source));
  const template = descriptor.template
    ? this.compileTemplate(filename, descriptor.template)
    : undefined;
  const styles = descriptor.styles.map((style) =>
    this.compileStyle(filename, scopeId, style)
  );
  const { script: rawScript, customBlocks } = descriptor;
  const script = rawScript
    ? {
        code: rawScript.src
          ? this.read(rawScript.src, filename)
          : rawScript.content,
        map: rawScript.map,
        lang: rawScript.lang,
      }
    : undefined;

  return {
    scopeId,
    template,
    styles,
    script,
    customBlocks,
  };
};

exports.compileToDescriptorAsync = async function (filename, source) {
  const descriptor = parse({
    source,
    filename,
    needMap: true,
    compiler: templateCompiler,
  });
  const scopeId =
    "data-v-" +
    (this.template.isProduction
      ? hash(path.basename(filename) + source)
      : hash(filename + source));
  const template = descriptor.template
    ? this.compileTemplate(filename, descriptor.template)
    : undefined;
  const styles = await Promise.all(
    descriptor.styles.map((style) =>
      this.compileStyleAsync(filename, scopeId, style)
    )
  );
  const { script: rawScript, customBlocks } = descriptor;
  const script = rawScript
    ? {
        code: rawScript.src
          ? this.read(rawScript.src, filename)
          : rawScript.content,
        map: rawScript.map,
        lang: rawScript.lang,
      }
    : undefined;

  return {
    scopeId,
    template,
    styles,
    script,
    customBlocks,
  };
};
