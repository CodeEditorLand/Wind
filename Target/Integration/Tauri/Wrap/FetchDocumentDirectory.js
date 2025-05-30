var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { documentDir as SourceApi } from "@tauri-apps/api/path";
import { FromAsync } from "../../../Effect/Produce.js";
import { PathProblem } from "../Errors.js";
const CreateProblem = /* @__PURE__ */ __name((cause) => new PathProblem({ cause, operation: "documentDir" }), "CreateProblem");
const Fetch = FromAsync(SourceApi, CreateProblem, { operation: "documentDir" });
var FetchDocumentDirectory_default = Fetch;
export {
  FetchDocumentDirectory_default as default
};
//# sourceMappingURL=FetchDocumentDirectory.js.map
