import type { Signal } from "solid-js";
import { makeHeartbeatWS } from "@solid-primitives/websocket";
export type Type = Signal<ReturnType<typeof makeHeartbeatWS>>;
declare const _default: Signal<WebSocket & {
    reconnect: () => void;
}>;
export default _default;
