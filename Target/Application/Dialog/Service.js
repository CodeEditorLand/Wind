var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option } from "../../effect";
import { HostService } from "../Host/Service.js";
import { DialogProblem } from "./Error.js";
class DialogService extends Effect.Service()("Service/Dialog", {
  effect: Effect.gen(function* () {
    const Host = yield* HostService;
    const ShowOpenDialog = /* @__PURE__ */ __name((Options = {}) => Host.ShowOpenDialog(Options).pipe(
      Effect.map(Option.getOrUndefined),
      Effect.mapError(
        (Cause) => new DialogProblem({
          Cause,
          Context: "ShowOpenDialogFailed"
        })
      )
    ), "ShowOpenDialog");
    const ShowSaveDialog = /* @__PURE__ */ __name((Options = {}) => Host.ShowSaveDialog(Options).pipe(
      Effect.map(Option.getOrUndefined),
      Effect.mapError(
        (Cause) => new DialogProblem({
          Cause,
          Context: "ShowSaveDialogFailed"
        })
      )
    ), "ShowSaveDialog");
    return { ShowOpenDialog, ShowSaveDialog };
  })
}) {
  static {
    __name(this, "DialogService");
  }
}
export {
  DialogService
};
//# sourceMappingURL=Service.js.map
