var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Layer } from "../../effect";
import { ProvideHost } from "../../Integration/Tauri.js";
const HostServiceLivePlaceholder = Layer.succeed(ProvideHost, {
  openWindow: /* @__PURE__ */ __name((targets, options) => {
    console.log(
      "[MockHostService] openWindow called with:",
      targets,
      options
    );
    return Promise.resolve();
  }, "openWindow")
});
export {
  HostServiceLivePlaceholder
};
//# sourceMappingURL=_HostServicePlaceholder.js.map
