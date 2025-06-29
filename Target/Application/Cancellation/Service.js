var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
class CancellationService extends Effect.Service()(
  "Service/Cancellation",
  {
    sync: /* @__PURE__ */ __name(() => ({
      CancelToken: /* @__PURE__ */ __name((_TokenId) => Effect.void, "CancelToken")
    }), "sync")
  }
) {
  static {
    __name(this, "CancellationService");
  }
}
export {
  CancellationService
};
//# sourceMappingURL=Service.js.map
