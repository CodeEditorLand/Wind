var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { homeDir as SourceApi } from "@tauri-apps/api/path";
import { FromAsync } from "../../../Effect/Produce.js";
import { PathProblem } from "../Errors.js";
const CreateProblem = /* @__PURE__ */ __name((cause) => new PathProblem({ cause, operation: "homeDir" }), "CreateProblem");
const Fetch = FromAsync(
  SourceApi,
  CreateProblem,
  { operation: "homeDir" }
);
var FetchHomeDirectory_default = Fetch;
export {
  FetchHomeDirectory_default as default
};
//# sourceMappingURL=FetchHomeDirectory.js.map
