var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option, pipe } from "../../../effect";
import {
  ProcessOpenResultToUriArray,
  RequestTauriOpen,
  ResolveFinalDefaultPath
} from "../../../Integration/Tauri.js";
import CreateShowOpenOption from "../Factory/CreateShowOpenOption.js";
function Orchestrate(options) {
  return pipe(
    ResolveFinalDefaultPath(options.defaultUri),
    Effect.flatMap(
      (defaultPath) => pipe(
        options.canSelectFolders && options.canSelectFiles ? Effect.logWarning(
          "Tauri 'open' dialog: VSCode requested both file and folder selection. Backend behavior for 'directory' flag will determine outcome."
        ) : Effect.void,
        Effect.andThen(
          () => RequestTauriOpen(
            CreateShowOpenOption(options, defaultPath)
          )
        )
      )
    ),
    Effect.map(ProcessOpenResultToUriArray)
  );
}
__name(Orchestrate, "Orchestrate");
export {
  Orchestrate as default
};
//# sourceMappingURL=ShowOpen.js.map
