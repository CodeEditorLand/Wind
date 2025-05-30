var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Option, pipe } from "../../../effect";
import { localize } from "vs/nls";
import {
  ConvertFiltersToTauri
} from "../../../Integration/Tauri.js";
function Create(options, defaultPath) {
  return pipe(
    {
      title: options.title || localize("saveAsTitle", "Save As")
    },
    (current) => Option.match(defaultPath, {
      onNone: /* @__PURE__ */ __name(() => current, "onNone"),
      onSome: /* @__PURE__ */ __name((path) => ({ ...current, defaultPath: path }), "onSome")
    }),
    (current) => Option.match(ConvertFiltersToTauri(options.filters), {
      onNone: /* @__PURE__ */ __name(() => current, "onNone"),
      onSome: /* @__PURE__ */ __name((filters) => ({ ...current, filters }), "onSome")
    })
  );
}
__name(Create, "Create");
export {
  Create as default
};
//# sourceMappingURL=CreateSaveOption.js.map
