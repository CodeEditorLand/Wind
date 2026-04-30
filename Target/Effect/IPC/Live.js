import { Layer } from "effect";
import { TauriIPCLive } from "./Implementation/TauriIPC.js";
import { IPCTag } from "./Tag/IPCTag.js";
const IPCTauriLive = Layer.effect(IPCTag, TauriIPCLive);
var Live_default = IPCTauriLive;
export {
  IPCTauriLive,
  Live_default as default
};
//# sourceMappingURL=Live.js.map
