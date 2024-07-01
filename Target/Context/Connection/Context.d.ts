import type { Context } from "solid-js";
export type Type = Context<{
    Messages: Messages;
    Socket: Socket;
    State: State;
    Status: Status;
    States: States;
}>;
export declare const _Function: Context<{
    Messages: import("solid-js").Signal<import("./Message").Type>;
    Socket: import("solid-js").Signal<WebSocket & {
        reconnect: () => void;
    }>;
    State: import("solid-js").Accessor<0 | 2 | 1 | 3>;
    Status: import("solid-js").Signal<Type>;
    States: Type;
}>;
declare const _default: {
    Messages: import("solid-js").Signal<import("./Message").Type>;
    Socket: import("solid-js").Signal<WebSocket & {
        reconnect: () => void;
    }>;
    State: import("solid-js").Accessor<0 | 2 | 1 | 3>;
    Status: import("solid-js").Signal<Type>;
    States: Type;
};
export default _default;
