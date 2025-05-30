var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option } from "../../../effect";
import { localize } from "vs/nls";
import {
  InheritanceProblem,
  ProvideHost,
  UriType
} from "../../../Integration/Tauri.js";
import PerformShowSave from "../Orchestrate/ShowSave.js";
import DecideSimplified from "./DecideSimplified.js";
function Pick(schema, options) {
  if (!DecideSimplified(schema)) {
    return PerformShowSave({
      ...options,
      title: options.title ?? localize("saveAsTitle", "Save As")
    }).pipe(Effect.map(Option.getOrUndefined));
  }
  return Effect.fail(
    new InheritanceProblem({
      method: "pickFileSaveSimplified_Super",
      cause: "Simplified non-file save not implemented"
    })
  );
}
__name(Pick, "Pick");
export {
  Pick as default
};
//# sourceMappingURL=PickFileSaveSimplified.js.map
