var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option, pipe } from "../../../effect";
import {
  DefineFileOpen,
  DefineFolderOpen,
  DefineWorkspaceOpen,
  ProcessOpenResultToSingleUri,
  ProvideHost,
  RequestHostWindowOpen,
  RequestTauriOpen,
  ResolveFinalDefaultPath
} from "../../../Integration/Tauri.js";
import CreatePickOpenOption from "../Factory/CreatePickOpenOption.js";
import CreateWindowOption from "../Factory/CreateWindowOption.js";
function Orchestrate(options, config) {
  return pipe(
    ResolveFinalDefaultPath(
      options.defaultUri
    ),
    Effect.map(
      (defaultPath) => CreatePickOpenOption(
        options,
        config,
        defaultPath
      )
    ),
    Effect.flatMap((tauriOptions) => RequestTauriOpen(tauriOptions)),
    Effect.map(ProcessOpenResultToSingleUri),
    Effect.flatMap(
      (maybeUri) => Option.match(maybeUri, {
        // Use Option.match; branches return Effect
        onNone: /* @__PURE__ */ __name(() => Effect.void, "onNone"),
        onSome: /* @__PURE__ */ __name((selectedUri) => RequestHostWindowOpen(
          [
            config.itemType === "folder" ? DefineFolderOpen(selectedUri) : config.itemType === "file" ? DefineFileOpen(selectedUri) : DefineWorkspaceOpen(selectedUri)
          ],
          CreateWindowOption(options)
        ), "onSome")
      })
    )
  );
}
__name(Orchestrate, "Orchestrate");
export {
  Orchestrate as default
};
//# sourceMappingURL=PickAndOpen.js.map
