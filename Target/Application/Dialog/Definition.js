var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option, pipe, Runtime } from "../../effect";
import { localize } from "vs/nls";
import {
  ConfirmResult
} from "vs/platform/dialogs/common/dialogs";
import {
  ProvideHost,
  UriConstructor
} from "../../Integration/Tauri.js";
import { HostServiceLivePlaceholder } from "./_HostServicePlaceholder.js";
import * as Orchestrate from "./Orchestration.js";
const _getAbstractPickFileToSaveOptions = /* @__PURE__ */ __name((path, _fileSystems) => ({
  defaultUri: path,
  title: localize("saveAsTitle", "Save As")
}), "_getAbstractPickFileToSaveOptions");
const ServiceRuntime = Runtime.make(HostServiceLivePlaceholder);
const Definition = {
  _serviceBrand: void 0,
  _run: /* @__PURE__ */ __name((eff) => {
    return Runtime.runPromise(ServiceRuntime)(eff);
  }, "_run"),
  _runOption: /* @__PURE__ */ __name((eff) => {
    return Definition._run(eff.pipe(Effect.map(Option.getOrUndefined)));
  }, "_runOption"),
  _runVoid: /* @__PURE__ */ __name((eff) => {
    return Definition._run(Effect.void(eff));
  }, "_runVoid"),
  pickFileFolderAndOpen: /* @__PURE__ */ __name((options) => Definition._runVoid(
    Orchestrate.PerformPickAndOpen(options, {
      titleKey: "openFileOrFolderDefaultTitle",
      defaultTitle: "Open File or Folder",
      tauriDirectory: true,
      itemType: "folder"
    })
  ), "pickFileFolderAndOpen"),
  pickFileAndOpen: /* @__PURE__ */ __name((options) => Definition._runVoid(
    Orchestrate.PerformPickAndOpen(options, {
      titleKey: "openFileDefaultTitle",
      defaultTitle: "Open File",
      tauriDirectory: false,
      itemType: "file"
    })
  ), "pickFileAndOpen"),
  pickFolderAndOpen: /* @__PURE__ */ __name((options) => Definition._runVoid(
    Orchestrate.PerformPickAndOpen(options, {
      titleKey: "openFolderDefaultTitle",
      defaultTitle: "Open Folder",
      tauriDirectory: true,
      itemType: "folder"
    })
  ), "pickFolderAndOpen"),
  pickWorkspaceAndOpen: /* @__PURE__ */ __name((options) => Definition._runVoid(
    Orchestrate.PerformPickAndOpen(options, {
      titleKey: "openWorkspaceDefaultTitle",
      defaultTitle: "Open Workspace",
      tauriDirectory: false,
      itemType: "workspace",
      defaultWorkspaceFilter: true
    })
  ), "pickWorkspaceAndOpen"),
  pickFileToSave: /* @__PURE__ */ __name((path, fileSystems) => Definition._run(
    pipe(
      Effect.succeed(
        _getAbstractPickFileToSaveOptions(path, fileSystems)
      ),
      Effect.flatMap(
        (configOptions) => Orchestrate.PerformShowSave(configOptions)
      ),
      Effect.map(Option.getOrUndefined)
    )
  ), "pickFileToSave"),
  showSaveDialog: /* @__PURE__ */ __name((options) => Definition._runOption(Orchestrate.PerformShowSave(options)), "showSaveDialog"),
  showOpenDialog: /* @__PURE__ */ __name((options) => Definition._run(
    // Returns Promise<UriType[] | undefined>
    Orchestrate.PerformShowOpen(options).pipe(
      Effect.map(Option.getOrElse(() => []))
    )
  ), "showOpenDialog"),
  defaultFilePath: /* @__PURE__ */ __name((filter) => Definition._run(
    Effect.succeed(
      UriConstructor.file(`/mock/file/${filter || "default"}`)
    )
  ), "defaultFilePath"),
  defaultFolderPath: /* @__PURE__ */ __name((filter) => Definition._run(
    Effect.succeed(
      UriConstructor.file(`/mock/folder/${filter || "default"}`)
    )
  ), "defaultFolderPath"),
  defaultWorkspacePath: /* @__PURE__ */ __name((filter) => Definition._run(
    Effect.succeed(
      UriConstructor.file(`/mock/workspace/${filter || "default"}`)
    )
  ), "defaultWorkspacePath"),
  preferredHome: /* @__PURE__ */ __name((filter) => Definition._run(
    Effect.succeed(
      UriConstructor.file(`/mock/home/${filter || "default"}`)
    )
  ), "preferredHome"),
  showSaveConfirm: /* @__PURE__ */ __name((filesOrResources) => Definition._run(Effect.succeed(ConfirmResult.SAVE)), "showSaveConfirm")
};
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
