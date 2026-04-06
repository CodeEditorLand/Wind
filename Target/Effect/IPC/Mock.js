import { Effect as n, Stream as s, Layer as t } from "effect";

import { IPCTag as c } from "./Tag/IPCTag.js";

const o = t.succeed(c, {
	send: (e) => (r) => n.void,
	invoke: (e) => (r) => n.succeed({}),
	events: (e) => s.empty,
	once: (e) => n.succeed({ channel: e, args: [] }),
	removeAllListeners: (e) => n.void,
});
var l = o;
export { o as MockIPCLive, l as default };
