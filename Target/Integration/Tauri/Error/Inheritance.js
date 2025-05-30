var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Data } from "../../../effect";
class Problem extends Data.TaggedError("InheritanceProblem") {
  static {
    __name(this, "Problem");
  }
  constructor(props) {
    super(props);
  }
}
export {
  Problem as default
};
//# sourceMappingURL=Inheritance.js.map
