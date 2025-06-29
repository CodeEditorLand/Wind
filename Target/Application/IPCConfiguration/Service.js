var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
class IPCConfigurationService extends Effect.Service()(
  "Service/IPCConfiguration",
  {
    sync: /* @__PURE__ */ __name(() => ({
      MountainAddress: "localhost:50051"
    }), "sync")
  }
) {
  static {
    __name(this, "IPCConfigurationService");
  }
}
export {
  IPCConfigurationService
};
//# sourceMappingURL=Service.js.map
