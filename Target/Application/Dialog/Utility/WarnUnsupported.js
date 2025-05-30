var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../../effect";
import {
  ShowTauriMessage
} from "../../../Integration/Tauri.js";
function Warn(context) {
  return ShowTauriMessage(
    `The requested file operation (${context}) might not be fully optimal in this environment.`,
    { title: "Notice", kind: "warning" }
  );
}
__name(Warn, "Warn");
export {
  Warn as default
};
//# sourceMappingURL=WarnUnsupported.js.map
