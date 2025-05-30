var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VsCodeScheme } from "../../../Integration/Tauri.js";
function Decide(scheme) {
  return ![
    VsCodeScheme.file,
    VsCodeScheme.vscodeUserData,
    VsCodeScheme.tmp
  ].includes(scheme);
}
__name(Decide, "Decide");
export {
  Decide as default
};
//# sourceMappingURL=DecideSimplified.js.map
