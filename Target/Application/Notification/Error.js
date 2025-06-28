var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Data } from "../../effect";
class NotificationProblem extends Data.TaggedError(
  "NotificationProblem"
) {
  static {
    __name(this, "NotificationProblem");
  }
}
export {
  NotificationProblem
};
//# sourceMappingURL=Error.js.map
