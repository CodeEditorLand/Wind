var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {} from "@tauri-apps/api/event";
import { Effect, Option } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import { IntegrationService } from "../../Integration/Tauri/Service.js";
import {} from "../../Platform/VSCode/Type.js";
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
  cwd: /* @__PURE__ */ __name(() => Configuration.cwd, "cwd"),
  env: { ...Configuration.userEnv },
  versions: Configuration.versions,
  getProcessMemoryInfo: /* @__PURE__ */ __name(() => Promise.resolve({
    residentSet: 0,
    private: 0,
    shared: 0
  }), "getProcessMemoryInfo"),
  sandboxed: true,
  mas: false,
  windows: Configuration.platform === "win32",
  linux: Configuration.platform === "linux",
  darwin: Configuration.platform === "darwin",
  // --- Stubs for other NodeJS.Process properties ---
  title: "wind",
  version: "1.0.0",
  config: {},
  argv: [],
  execArgv: [],
  mainModule: void 0,
  exit: /* @__PURE__ */ __name((_code) => {
    throw new Error(
      "process.exit is not supported in this environment."
    );
  }, "exit")
}), "CreateProcessShim");
class HostService extends Effect.Service()("wind/HostService", {
  effect: Effect.gen(function* () {
    const Integration = yield* IntegrationService;
    const CreateProxyEffect = /* @__PURE__ */ __name((Method, Context) => {
      return (...Arguments) => Integration.Invoke(
        Method,
        ...Arguments
      ).pipe(
        Effect.mapError(
          (cause) => new HostServiceProblem({ Cause: cause, Context })
        )
      );
    }, "CreateProxyEffect");
    const Configuration = yield* CreateProxyEffect(
      "MountainGetWorkbenchConfiguration",
      "FailedToFetchInitialConfiguration"
    )();
    const OnDidChangeWindowStateEmitter = new Emitter();
    yield* Integration.Listen(
      "sky://window/did-change-focus",
      (Event) => {
        if (Event.payload !== void 0) {
          OnDidChangeWindowStateEmitter.fire(Event.payload);
        }
      }
    );
    return {
      Configuration,
      ProvideGlobals: /* @__PURE__ */ __name(() => Effect.sync(() => {
        window.vscode = {
          ipcRenderer: CreateIpcRendererShim(Integration),
          process: CreateProcessShim(Configuration)
        };
      }), "ProvideGlobals"),
      NotifyReady: /* @__PURE__ */ __name(() => Integration.Emit("sky://lifecycle/ready").pipe(
        Effect.mapError(
          (Cause) => new HostServiceProblem({
            Cause,
            Context: "FailedToNotifyHostReady"
          })
        )
      ), "NotifyReady"),
      Logger: CreateProxyEffect(
        "sky://log",
        "LogForwardingFailed"
      ),
      OnDidChangeWindowState: OnDidChangeWindowStateEmitter.event,
      ShowTextDocument: CreateProxyEffect("WorkSpace.ShowTextDocument", "ShowTextDocumentFailed"),
      ShowOpenDialog: CreateProxyEffect("UserInterface.ShowOpenDialog", "ShowOpenDialogFailed"),
      ShowSaveDialog: CreateProxyEffect("UserInterface.ShowSaveDialog", "ShowSaveDialogFailed"),
      ShowSaveConfirm: CreateProxyEffect("UserInterface.ShowSaveConfirm", "ShowSaveConfirmFailed"),
      OpenFile: CreateProxyEffect(
        "WorkSpace.OpenFile",
        "OpenFileFailed"
      ),
      Stat: CreateProxyEffect(
        "FileSystem.Stat",
        "StatFailed"
      ),
      ReadDirectory: CreateProxyEffect(
        "FileSystem.ReadDirectory",
        "ReadDirectoryFailed"
      ),
      CreateDirectory: CreateProxyEffect(
        "FileSystem.CreateDirectory",
        "CreateDirectoryFailed"
      ),
      ReadFile: CreateProxyEffect(
        "FileSystem.ReadFile",
        "ReadFileFailed"
      ),
      WriteFile: CreateProxyEffect("FileSystem.WriteFile", "WriteFileFailed"),
      Delete: CreateProxyEffect(
        "FileSystem.Delete",
        "DeleteFailed"
      ),
      Rename: CreateProxyEffect(
        "FileSystem.Rename",
        "RenameFailed"
      ),
      Copy: CreateProxyEffect(
        "FileSystem.Copy",
        "CopyFailed"
      ),
      ShowNotification: CreateProxyEffect(
        "UserInterface.ShowNotification",
        "ShowNotificationFailed"
      ),
      ShowPrompt: CreateProxyEffect("UserInterface.ShowPrompt", "ShowPromptFailed"),
      ShowStatusMessage: CreateProxyEffect("UserInterface.ShowStatusMessage", "ShowStatusMessageFailed"),
      SetStatusBarItem: CreateProxyEffect(
        "UserInterface.SetStatusBarItem",
        "SetStatusBarItemFailed"
      ),
      DisposeStatusBarItem: CreateProxyEffect(
        "UserInterface.DisposeStatusBarItem",
        "DisposeStatusBarItemFailed"
      ),
      SetStatusBarMessage: CreateProxyEffect(
        "UserInterface.SetStatusBarMessage",
        "SetStatusBarMessageFailed"
      ),
      DisposeStatusBarMessage: CreateProxyEffect(
        "UserInterface.DisposeStatusBarMessage",
        "DisposeStatusBarMessageFailed"
      ),
      SetWebviewHtml: CreateProxyEffect(
        "WebView.SetHtml",
        "SetWebviewHtmlFailed"
      ),
      SetWebviewOptions: CreateProxyEffect("WebView.SetOptions", "SetWebviewOptionsFailed"),
      PostMessageToWebview: CreateProxyEffect(
        "WebView.PostMessage",
        "PostMessageToWebviewFailed"
      ),
      SetWebviewTitle: CreateProxyEffect(
        "WebView.SetTitle",
        "SetWebviewTitleFailed"
      ),
      SetWebviewIconPath: CreateProxyEffect("WebView.SetIconPath", "SetWebviewIconPathFailed"),
      RevealWebviewPanel: CreateProxyEffect("WebView.Reveal", "RevealWebviewPanelFailed"),
      DisposeWebview: CreateProxyEffect(
        "WebView.Dispose",
        "DisposeWebviewFailed"
      )
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
