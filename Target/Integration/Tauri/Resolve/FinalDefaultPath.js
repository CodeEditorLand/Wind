var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option, pipe } from "../../../effect";
import { ConvertUriToPathString } from "../Converters.js";
import ResolveFallbackDefaultPath from "./FallbackDefaultPath.js";
function Resolve(MaybeUri) {
  return pipe(
    ConvertUriToPathString(MaybeUri),
    // Pure conversion
    Option.match({
      onSome: /* @__PURE__ */ __name((PathString) => Effect.succeed(Option.some(PathString)), "onSome"),
      onNone: /* @__PURE__ */ __name(() => ResolveFallbackDefaultPath, "onNone")
    })
  );
}
__name(Resolve, "Resolve");
export {
  Resolve as default
};
//# sourceMappingURL=FinalDefaultPath.js.map
