var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FromMethod } from "../../../Effect/Produce.js";
import { Host as HostServiceTag } from "../../../Platform/VSCode/Provide.js";
import { WindowProblem } from "../Errors.js";
const CreateProblem = /* @__PURE__ */ __name((cause) => new WindowProblem({ cause, operation: "hostServiceOpenWindow" }), "CreateProblem");
const Request = FromMethod(
  HostServiceTag,
  // Use the Tag
  "openWindow",
  // Method name on PerformHostAction interface
  CreateProblem,
  { operation: "hostServiceOpenWindow" }
);
var RequestHostWindowOpen_default = Request;
export {
  RequestHostWindowOpen_default as default
};
//# sourceMappingURL=RequestHostWindowOpen.js.map
