var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { open as SourceApi } from "@tauri-apps/plugin-dialog";
import { OptionalFromAsync } from "../../../Effect/Produce.js";
import { DialogProblem } from "../Errors.js";
const CreateProblem = /* @__PURE__ */ __name((cause) => new DialogProblem({ cause, operation: "open" }), "CreateProblem");
const Request = OptionalFromAsync(
  SourceApi,
  CreateProblem,
  { operation: "open" }
);
var RequestOpenDialog_default = Request;
export {
  RequestOpenDialog_default as default
};
//# sourceMappingURL=RequestOpenDialog.js.map
