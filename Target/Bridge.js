var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { invoke as TauriInvoke } from "@tauri-apps/api/core";
import {
  emit as TauriEmit,
  listen as TauriListen
} from "@tauri-apps/api/event";
import { URI } from "vs/base/common/uri.js";
const CreateIpcRendererShim = /* @__PURE__ */ __name(() => ({
  send: /* @__PURE__ */ __name((Channel, ...Arguments) => {
    if (Channel.startsWith("vscode:")) {
      TauriInvoke("mountain_ipc_bridge_send", {
        Channel,
        ArgumentsList: Arguments
      }).catch(
        (Error2) => console.error(
          `[Bridge] Error in send for '${Channel}':`,
          Error2
        )
      );
    }
  }, "send"),
  invoke: /* @__PURE__ */ __name(async (Channel, ...Arguments) => {
    if (Channel.startsWith("vscode:")) {
      const Command = `vscode_ipc:${Channel.substring(7)}`;
      try {
        return await TauriInvoke(Command, { Arguments });
      } catch (Error2) {
        console.error(`[Bridge] Error invoking '${Command}':`, Error2);
        throw Error2;
      }
    }
    throw new Error(`[Bridge] Unsupported invoke channel: ${Channel}`);
  }, "invoke"),
  on: /* @__PURE__ */ __name((Channel, Listener) => {
    TauriListen(
      Channel,
      (Event) => Listener({}, Event.payload)
    ).catch(console.error);
    return CreateIpcRendererShim();
  }, "on"),
  // Stubs for other Emitter methods to fulfill the interface.
  once: /* @__PURE__ */ __name(() => CreateIpcRendererShim(), "once"),
  removeListener: /* @__PURE__ */ __name(() => CreateIpcRendererShim(), "removeListener"),
  emit: /* @__PURE__ */ __name((channel, ...args) => {
    TauriEmit(channel, ...args).catch(console.error);
    return true;
  }, "emit")
}), "CreateIpcRendererShim");
const ResolveConfiguration = /* @__PURE__ */ __name(async () => {
  try {
    const RawConfig = await TauriInvoke(
      "mountain_get_workbench_configuration"
    );
    const ReviveUris = /* @__PURE__ */ __name((Data) => {
      if (!Data || typeof Data !== "object") {
        return Data;
      }
      if (Array.isArray(Data)) {
        return Data.map(ReviveUris);
      }
      if (Data.scheme && Data.path) {
        return URI.revive(Data);
      }
      for (const Key in Data) {
        if (Object.prototype.hasOwnProperty.call(Data, Key)) {
          Data[Key] = ReviveUris(Data[Key]);
        }
      }
      return Data;
    }, "ReviveUris");
    return ReviveUris(RawConfig);
  } catch (Error2) {
    console.error(
      "[Bridge] FATAL: Could not fetch workbench configuration from host.",
      Error2
    );
    throw new Error2("Failed to resolve initial workbench configuration.");
  }
}, "ResolveConfiguration");
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
  sandboxed: true
}), "CreateProcessShim");
(async () => {
  try {
    const Configuration = await ResolveConfiguration();
    const Globals = {
      ipcRenderer: CreateIpcRendererShim(),
      process: CreateProcessShim(Configuration),
      context: {
        configuration: /* @__PURE__ */ __name(() => Configuration, "configuration"),
        resolveConfiguration: /* @__PURE__ */ __name(function() {
          throw new Error("Function not implemented.");
        }, "resolveConfiguration")
      },
      // Stubs for other expected globals.
      webFrame: { setZoomLevel: /* @__PURE__ */ __name(() => {
      }, "setZoomLevel") },
      webUtils: { getPathForFile: /* @__PURE__ */ __name((file) => file.path, "getPathForFile") },
      ipcMessagePort: { acquire: /* @__PURE__ */ __name(() => {
      }, "acquire") }
    };
    window.vscode = Globals;
    console.log(
      "[Wind Bridge] Successfully attached vscode shims to the window object."
    );
  } catch (error) {
    const ErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Wind Bridge] FATAL: Failed to initialize.", error);
    const ErrorDiv = document.createElement("div");
    ErrorDiv.textContent = `Bridge Error: ${ErrorMessage}`;
    ErrorDiv.setAttribute(
      "style",
      "color:red;padding:20px;font-family:sans-serif;"
    );
    document.addEventListener(
      "DOMContentLoaded",
      () => document.body.prepend(ErrorDiv)
    );
  }
})();
//# sourceMappingURL=Bridge.js.map
