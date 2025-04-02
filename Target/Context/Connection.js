var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createComponent as _$createComponent } from "solid-js/web";
var Connection_default = /* @__PURE__ */ __name(({
  children
}) => {
  return _$createComponent(_Function.Provider, {
    get value() {
      return _Function.defaultValue;
    },
    children
  });
}, "default");
const {
  createEffect,
  on
} = await import("solid-js");
const {
  default: Connection,
  _Function
} = await import("./Connection/Context.js");
export {
  Connection,
  _Function,
  createEffect,
  Connection_default as default,
  on
};
//# sourceMappingURL=Connection.js.map
