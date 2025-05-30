var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { save as SourceApi } from "@tauri-apps/plugin-dialog";
import { OptionalFromAsync } from "../../../Effect/Produce.js";
import { DialogProblem } from "../Errors.js";
const CreateProblem = /* @__PURE__ */ __name((cause) => new DialogProblem({ cause, operation: "save" }), "CreateProblem");
const Request = OptionalFromAsync(
  SourceApi,
  CreateProblem,
  { operation: "save" }
);
var RequestSaveDialog_default = Request;
export {
  RequestSaveDialog_default as default
};
//# sourceMappingURL=RequestSaveDialog.js.map
