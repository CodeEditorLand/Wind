var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option } from "../../effect";
function OptionalFromAsync(Source, CreateProblem, StaticData) {
  return (...args) => Effect.tryPromise({
    try: /* @__PURE__ */ __name(() => Source(...args), "try"),
    catch: /* @__PURE__ */ __name((cause) => CreateProblem({ ...StaticData, cause }), "catch")
  }).pipe(Effect.map(Option.fromNullable));
}
__name(OptionalFromAsync, "OptionalFromAsync");
export {
  OptionalFromAsync as default
};
//# sourceMappingURL=OptionalFromAsync.js.map
