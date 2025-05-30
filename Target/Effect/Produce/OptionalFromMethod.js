var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Option } from "../../effect";
function OptionalFromMethod(ServiceTag, MethodName, CreateProblem, StaticData) {
  return (...args) => Effect.flatMap(ServiceTag, (ServiceInstance) => {
    const Operation = ServiceInstance[MethodName];
    return Effect.tryPromise({
      try: /* @__PURE__ */ __name(() => Operation.apply(ServiceInstance, args), "try"),
      catch: /* @__PURE__ */ __name((cause) => CreateProblem({ ...StaticData, cause }), "catch")
    }).pipe(Effect.map(Option.fromNullable));
  });
}
__name(OptionalFromMethod, "OptionalFromMethod");
export {
  OptionalFromMethod as default
};
//# sourceMappingURL=OptionalFromMethod.js.map
