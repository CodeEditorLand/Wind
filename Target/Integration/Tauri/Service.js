var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
class IntegrationService extends Effect.Service()(
  "Integration/Tauri",
  {
    // This is a placeholder implementation. The real implementation will be
    // built out later and will wrap the actual Tauri APIs.
    sync: /* @__PURE__ */ __name(() => ({
      Invoke: /* @__PURE__ */ __name((Command, _Arguments) => Effect.dieMessage(
        `IntegrationService.Invoke not implemented for command: ${Command}`
      ), "Invoke"),
      Listen: /* @__PURE__ */ __name((_EventName, _Handler) => Effect.dieMessage(`IntegrationService.Listen not implemented`), "Listen"),
      Emit: /* @__PURE__ */ __name((_EventName, _Payload) => Effect.dieMessage(`IntegrationService.Emit not implemented`), "Emit")
    }), "sync")
  }
) {
  static {
    __name(this, "IntegrationService");
  }
}
export {
  IntegrationService
};
//# sourceMappingURL=Service.js.map
