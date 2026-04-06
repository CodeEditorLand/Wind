import { Layer as r } from "effect";

import { TauriIPCLive as e } from "./Implementation/TauriIPC.js";
import { IPCTag as o } from "./Tag/IPCTag.js";

const t = r.effect(o, e);
var a = t;
export { t as IPCTauriLive, a as default };
