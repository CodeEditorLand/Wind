import e from "../Environment/Context.js";
import {
	createReconnectingWS as t,
	makeHeartbeatWS as r,
} from "@solid-primitives/websocket";
import { createSignal as a } from "solid-js";
var m = a(
	r(t(e.Data[0]().Socket, void 0, { delay: 0, retries: 5 }), {
		interval: 5e4,
		message: "beat",
	}),
);
export { m as default };
