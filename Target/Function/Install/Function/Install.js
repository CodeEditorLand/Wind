var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CreateIPCRenderer } from "./CreateIPCRenderer.js";
import { CreateProcess } from "./CreateProcess.js";
import { Fallback } from "./Fallback.js";
import { ResolveConfiguration } from "./ResolveConfiguration.js";
async function Install() {
  try {
    if (typeof window === "undefined") {
      const error = new Error(
        "Cannot install Wind polyfill: window is not defined"
      );
      console.error(error);
      return;
    }
    if (window.polyfillInstalled) {
      return;
    }
    window.polyfillInstalled = true;
    console.log("[Wind] Starting Wind preload installation...");
    const Configuration = await ResolveConfiguration();
    const IPCRenderer = CreateIPCRenderer();
    const Process = CreateProcess(Configuration);
    const preloadGlobals = {
      ipcRenderer: IPCRenderer,
      process: Process,
      configuration: Configuration
    };
    window.preloadGlobals = preloadGlobals;
    console.log("[Wind] preloadGlobals attached to window");
    const Globals = {
      ipcRenderer: IPCRenderer,
      process: Process,
      context: {
        configuration: /* @__PURE__ */ __name(() => Configuration, "configuration"),
        resolveConfiguration: /* @__PURE__ */ __name(async () => Configuration, "resolveConfiguration")
      },
      webFrame: { setZoomLevel: /* @__PURE__ */ __name(() => {
      }, "setZoomLevel") },
      webUtils: { getPathForFile: /* @__PURE__ */ __name((file) => file.name, "getPathForFile") },
      ipcMessagePort: {
        acquire: /* @__PURE__ */ __name((ResponseChannel, Nonce) => {
          console.log(
            `[Wind] MessagePort acquire: ${ResponseChannel}, nonce=${Nonce}`
          );
          const { port1, port2 } = new MessageChannel();
          window.postMessage(Nonce, "*", [port2]);
          port1.start();
          let Done = false;
          port1.onmessage = (Event) => {
            if (Done) return;
            const Data = Event.data;
            const Length = Data instanceof ArrayBuffer ? Data.byteLength : Data instanceof Uint8Array ? Data.byteLength : 0;
            if (Length > 1) {
              Done = true;
              console.log(
                "[Wind] Extension host: received init data, sending Initialized"
              );
              port1.postMessage(new Uint8Array([1]));
            }
          };
          setTimeout(() => {
            console.log("[Wind] Extension host: sending Ready");
            port1.postMessage(new Uint8Array([2]));
          }, 50);
        }, "acquire")
      }
    };
    window.vscode = Globals;
    console.info(
      "[Wind] Successfully installed Electron API polyfill for workbench."
    );
    window.__WIND_PRELOAD_READY__ = true;
    console.log("[Wind] Preload ready, Effect-TS bootstrap can proceed");
  } catch (error) {
    console.error(`[Wind] Install error:`, error);
    Fallback();
  }
}
__name(Install, "Install");
export {
  Install as default
};
//# sourceMappingURL=Install.js.map
