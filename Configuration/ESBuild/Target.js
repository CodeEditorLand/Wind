var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const On = (await import("./Wind.js")).On;
const Bundle = (await import("./Wind.js")).Bundle;
var Target_default = /* @__PURE__ */ __name(async (Current) => (await import("deepmerge-ts")).deepmerge(
  (await import("./Wind.js")).default,
  {
    outdir: "Target",
    drop: On ? [] : ["debugger", "console"],
    define: {
      __DEV__: On ? "true" : "false",
      __INCREMENT__: `"${`${On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`
    },
    treeShaking: true,
    entryPoints: (await import("@playform/build/Target/Function/Entry.js")).default(Current, ["Source/Configuration/*"]),
    platform: "browser",
    outbase: "Source"
    // external: Bundle
    // 	? [
    // 			"@tauri-apps/api/path",
    // 			"@tauri-apps/plugin-dialog",
    // 			"effect",
    // 			"vs/*",
    // 		]
    // 	: [],
  }
), "default");
export {
  Bundle,
  On,
  Target_default as default
};
//# sourceMappingURL=Target.js.map
