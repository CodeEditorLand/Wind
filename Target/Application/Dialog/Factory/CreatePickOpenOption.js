var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Option, pipe } from "../../../effect";
import { localize } from "vs/nls";
import {
  ConvertFiltersToTauri
} from "../../../Integration/Tauri.js";
function Create(options, config, defaultPath) {
  return pipe(
    {
      title: options.title || localize(config.titleKey, config.defaultTitle),
      multiple: false,
      directory: config.tauriDirectory
    },
    (current) => Option.match(defaultPath, {
      onNone: /* @__PURE__ */ __name(() => current, "onNone"),
      onSome: /* @__PURE__ */ __name((path) => ({ ...current, defaultPath: path }), "onSome")
    }),
    (current) => pipe(
      ConvertFiltersToTauri(options.filters),
      Option.orElse(
        () => config.defaultWorkspaceFilter && config.itemType === "workspace" ? Option.some([
          {
            name: "VS Code Workspace",
            extensions: ["code-workspace"]
          }
        ]) : Option.none()
      ),
      Option.filter(() => config.itemType !== "folder"),
      // Filters usually not for folder picking
      Option.match({
        onNone: /* @__PURE__ */ __name(() => current, "onNone"),
        onSome: /* @__PURE__ */ __name((filters) => ({ ...current, filters }), "onSome")
      })
    )
  );
}
__name(Create, "Create");
export {
  Create as default
};
//# sourceMappingURL=CreatePickOpenOption.js.map
