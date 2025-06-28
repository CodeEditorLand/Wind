var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option } from "../../effect";
import { URI } from "Source/Platform/VSCode/Type.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { HostServiceProblem } from "./Error.js";
const CreateIpcRendererShim = /* @__PURE__ */ __name((Integration) => ({
  invoke: /* @__PURE__ */ __name((Channel, ...Arguments) => Effect.runPromise(
    Integration.Invoke("DispatchFrontendCommand", {
      command: Channel,
      argument: Arguments
    })
  ), "invoke"),
  on: /* @__PURE__ */ __name((Channel, Listener) => Effect.runFork(Integration.Listen(Channel, Listener)), "on"),
  send: /* @__PURE__ */ __name((Channel, ...Arguments) => Effect.runFork(Integration.Emit(Channel, Arguments)), "send")
}), "CreateIpcRendererShim");
const CreateProcessShim = /* @__PURE__ */ __name((Configuration) => ({
  ...Configuration.userEnv,
  pid: -1,
  arch: Configuration.arch,
  platform: Configuration.platform,
  type: "renderer",
  cwd: /* @__PURE__ */ __name(() => Configuration.VSCODE_CWD, "cwd"),
  env: { ...Configuration.userEnv },
  versions: Configuration.versions,
  getProcessMemoryInfo: /* @__PURE__ */ __name(() => Promise.resolve({ total: 0, residentSet: 0, private: 0 }), "getProcessMemoryInfo"),
  sandboxed: true,
  mas: false,
  windows: Configuration.platform === "win32",
  linux: Configuration.platform === "linux",
  darwin: Configuration.platform === "darwin"
}), "CreateProcessShim");
class HostService extends Effect.Service()("wind/HostService", {
  effect: Effect.gen(function* (Generator) {
    const Integration = yield* Generator(IntegrationService);
    const Configuration = yield* Generator(
      Integration.Invoke(
        "MountainGetWorkbenchConfiguration"
      ).pipe(
        Effect.mapError(
          (Cause) => new HostServiceProblem({
            Cause,
            Context: "FailedToFetchInitialConfiguration"
          })
        )
      )
    );
    const ProvideGlobals = /* @__PURE__ */ __name(() => Effect.sync(() => {
      window.vscode = {
        ipcRenderer: CreateIpcRendererShim(Integration),
        process: CreateProcessShim(Configuration)
      };
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "FailedToProvideGlobals"
        })
      )
    ), "ProvideGlobals");
    const NotifyReady = /* @__PURE__ */ __name(() => Integration.Emit("sky://lifecycle/ready").pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "FailedToNotifyHostReady"
        })
      )
    ), "NotifyReady");
    const ShowOpenDialog = /* @__PURE__ */ __name((Options) => Integration.Invoke(
      "UserInterface.ShowOpenDialog",
      Options
    ).pipe(
      Effect.map(Option.fromNullable),
      Effect.map(Option.map((Uris) => Uris.map(URI.revive))),
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "ShowOpenDialogFailed"
        })
      )
    ), "ShowOpenDialog");
    const ShowSaveDialog = /* @__PURE__ */ __name((Options) => Integration.Invoke(
      "UserInterface.ShowSaveDialog",
      Options
    ).pipe(
      Effect.map(Option.fromNullable),
      Effect.map(Option.map(URI.revive)),
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "ShowSaveDialogFailed"
        })
      )
    ), "ShowSaveDialog");
    const ShowSaveConfirm = /* @__PURE__ */ __name((Files) => Integration.Invoke(
      "UserInterface.ShowSaveConfirm",
      Files
    ).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "ShowSaveConfirmFailed"
        })
      )
    ), "ShowSaveConfirm");
    const OpenFile = /* @__PURE__ */ __name((Uri) => Integration.Invoke("WorkSpace.OpenFile", Uri.fsPath).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "OpenFileFailed"
        })
      )
    ), "OpenFile");
    const Log = /* @__PURE__ */ __name((Level, Message) => Integration.Emit("sky://log", { Level, Message }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "LogForwardingFailed"
        })
      )
    ), "Log");
    const ShowNotification = /* @__PURE__ */ __name((Notification) => Integration.Invoke("UserInterface.ShowNotification", {
      Notification
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "ShowNotificationFailed"
        })
      )
    ), "ShowNotification");
    const ShowPrompt = /* @__PURE__ */ __name((Severity, Message, Choices, Options) => Integration.Invoke("UserInterface.ShowPrompt", {
      Severity,
      Message,
      Choices,
      Options
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "ShowPromptFailed"
        })
      )
    ), "ShowPrompt");
    const ShowStatusMessage = /* @__PURE__ */ __name((Message, Options) => Integration.Invoke("UserInterface.ShowStatusMessage", {
      Message: Message.toString(),
      // Ensure message is a string for IPC
      Options
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "ShowStatusMessageFailed"
        })
      )
    ), "ShowStatusMessage");
    const Stat = /* @__PURE__ */ __name((Uri) => Integration.Invoke("FileSystem.Stat", { Uri }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "StatFailed"
        })
      )
    ), "Stat");
    const ReadDirectory = /* @__PURE__ */ __name((Uri) => Integration.Invoke(
      "FileSystem.ReadDirectory",
      { Uri }
    ).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "ReadDirectoryFailed"
        })
      )
    ), "ReadDirectory");
    const CreateDirectory = /* @__PURE__ */ __name((Uri) => Integration.Invoke("FileSystem.CreateDirectory", {
      Uri
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "CreateDirectoryFailed"
        })
      )
    ), "CreateDirectory");
    const ReadFile = /* @__PURE__ */ __name((Uri) => Integration.Invoke("FileSystem.ReadFile", {
      Uri
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "ReadFileFailed"
        })
      )
    ), "ReadFile");
    const WriteFile = /* @__PURE__ */ __name((Uri, Content, Options) => Integration.Invoke("FileSystem.WriteFile", {
      Uri,
      Content,
      Options
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "WriteFileFailed"
        })
      )
    ), "WriteFile");
    const Delete = /* @__PURE__ */ __name((Uri, Options) => Integration.Invoke("FileSystem.Delete", {
      Uri,
      Options
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "DeleteFailed"
        })
      )
    ), "Delete");
    const Rename = /* @__PURE__ */ __name((Source, Target, Options) => Integration.Invoke("FileSystem.Rename", {
      Source,
      Target,
      Options
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "RenameFailed"
        })
      )
    ), "Rename");
    const Copy = /* @__PURE__ */ __name((Source, Target, Options) => Integration.Invoke("FileSystem.Copy", {
      Source,
      Target,
      Options
    }).pipe(
      Effect.mapError(
        (Cause) => new HostServiceProblem({
          Cause,
          Context: "CopyFailed"
        })
      )
    ), "Copy");
    return {
      Configuration,
      ProvideGlobals,
      NotifyReady,
      ShowOpenDialog,
      ShowSaveDialog,
      ShowSaveConfirm,
      OpenFile,
      Log,
      ShowNotification,
      ShowPrompt,
      ShowStatusMessage,
      Stat,
      ReadDirectory,
      CreateDirectory,
      ReadFile,
      WriteFile,
      Delete,
      Rename,
      Copy
    };
  })
}) {
  static {
    __name(this, "HostService");
  }
}
export {
  HostService
};
//# sourceMappingURL=Service.js.map
