var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CreateIPCRenderer } from "./CreateIPCRenderer.js";
import { CreateProcess } from "./CreateProcess.js";
import { Fallback } from "./Fallback.js";
import { ResolveConfiguration } from "./ResolveConfiguration.js";
const _Trace = /* @__PURE__ */ __name((Message) => {
  try {
    performance.mark(`land:install:${Message}`);
  } catch {
  }
}, "_Trace");
async function Install() {
  try {
    if (typeof window === "undefined") return;
    if (window.polyfillInstalled) {
      return;
    }
    window.polyfillInstalled = true;
    _Trace("start");
    const Configuration = await ResolveConfiguration();
    const IPCRenderer = CreateIPCRenderer();
    const Process = CreateProcess(Configuration);
    const preloadGlobals = {
      ipcRenderer: IPCRenderer,
      process: Process,
      configuration: Configuration
    };
    window.preloadGlobals = preloadGlobals;
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
          _Trace(`acquire:${ResponseChannel}`);
          const IsExtensionHost = ResponseChannel.includes(
            "startExtensionHostMessagePortResult"
          );
          const { port1, port2 } = new MessageChannel();
          window.postMessage(Nonce, "*", [port2]);
          if (IsExtensionHost) {
            port1.start();
            let Done = false;
            port1.onmessage = (Event) => {
              if (Done) return;
              const Data = Event.data;
              const Length = Data instanceof ArrayBuffer ? Data.byteLength : Data instanceof Uint8Array ? Data.byteLength : 0;
              if (Length > 1) {
                Done = true;
                port1.postMessage(new Uint8Array([1]));
              }
            };
            setTimeout(() => {
              port1.postMessage(new Uint8Array([2]));
            }, 50);
          }
        }, "acquire")
      }
    };
    window.vscode = Globals;
    window.__WIND_PRELOAD_READY__ = true;
    _Trace("done");
  } catch (error) {
    try {
      performance.mark(`land:install:error`);
    } catch {
    }
    Fallback();
  }
}
__name(Install, "Install");
export {
  Install as default
};
//# sourceMappingURL=Install.js.map
