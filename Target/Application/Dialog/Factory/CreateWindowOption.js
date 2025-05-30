var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { pipe } from "../../../effect";
function Create(options) {
  return pipe(
    { forceNewWindow: options.forceNewWindow ?? false },
    (current) => typeof options.forceReuseWindow === "boolean" ? {
      ...current,
      forceReuseWindow: options.forceReuseWindow
    } : current,
    (current) => options.remoteAuthority !== void 0 ? { ...current, remoteAuthority: options.remoteAuthority } : current
  );
}
__name(Create, "Create");
export {
  Create as default
};
//# sourceMappingURL=CreateWindowOption.js.map
