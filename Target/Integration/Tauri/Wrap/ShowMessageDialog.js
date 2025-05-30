var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { message as SourceApi } from "@tauri-apps/plugin-dialog";
import { FromAsync } from "../../../Effect/Produce.js";
import { DialogProblem } from "../Errors.js";
const CreateProblem = /* @__PURE__ */ __name((cause) => new DialogProblem({ cause, operation: "message" }), "CreateProblem");
const Show = FromAsync(
  SourceApi,
  CreateProblem,
  { operation: "message" }
);
var ShowMessageDialog_default = Show;
export {
  ShowMessageDialog_default as default
};
//# sourceMappingURL=ShowMessageDialog.js.map
