var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var JSON_default = /* @__PURE__ */ __name(async (...[File, From]) => JSON.parse(
  (await (await import("node:fs/promises")).readFile(`${From ?? "."}/${File}`, "utf-8")).toString()
), "default");
export {
  JSON_default as default
};
//# sourceMappingURL=JSON.js.map
