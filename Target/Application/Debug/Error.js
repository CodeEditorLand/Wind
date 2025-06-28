var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Data } from "../../effect";
class DebugProviderRegistrationProblem extends Data.TaggedError(
  "DebugProviderRegistrationProblem"
) {
  static {
    __name(this, "DebugProviderRegistrationProblem");
  }
}
class StartDebuggingProblem extends Data.TaggedError(
  "StartDebuggingProblem"
) {
  static {
    __name(this, "StartDebuggingProblem");
  }
}
export {
  DebugProviderRegistrationProblem,
  StartDebuggingProblem
};
//# sourceMappingURL=Error.js.map
