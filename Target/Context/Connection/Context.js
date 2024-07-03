import { createContext as t, useContext as e } from "solid-js";
const o = t({
	Messages: (await import("../Connection/Messages.js")).default,
	Socket: (await import("../Connection/Socket.js")).default,
	State: (await import("../Connection/State.js")).default,
	Status: (await import("../Connection/Status.js")).default,
	States: (await import("../Connection/States.js")).default,
});
var s = e(o);
export { o as _Function, s as default };
