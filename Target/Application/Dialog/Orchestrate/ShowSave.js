var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option, pipe } from "../../../effect";
import {
  ProcessSaveResultToUri,
  RequestTauriSave,
  ResolveFinalDefaultPath
} from "../../../Integration/Tauri.js";
import CreateSaveOption from "../Factory/CreateSaveOption.js";
function Orchestrate(options) {
  return pipe(
    ResolveFinalDefaultPath(options.defaultUri),
    Effect.map((defaultPath) => CreateSaveOption(options, defaultPath)),
    Effect.flatMap((tauriOptions) => RequestTauriSave(tauriOptions)),
    Effect.map(ProcessSaveResultToUri)
  );
}
__name(Orchestrate, "Orchestrate");
export {
  Orchestrate as default
};
//# sourceMappingURL=ShowSave.js.map
