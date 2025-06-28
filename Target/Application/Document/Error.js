var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Data } from "../../effect";
class DocumentNotFoundProblem extends Data.TaggedError(
  "DocumentNotFoundProblem"
) {
  static {
    __name(this, "DocumentNotFoundProblem");
  }
}
class ContentProviderProblem extends Data.TaggedError(
  "ContentProviderProblem"
) {
  static {
    __name(this, "ContentProviderProblem");
  }
}
export {
  ContentProviderProblem,
  DocumentNotFoundProblem
};
//# sourceMappingURL=Error.js.map
