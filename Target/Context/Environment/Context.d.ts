import type { Type as Data } from "@Context/Environment/Data";
import type { Context } from "solid-js";
export type Type = Context<{
    Data: Data;
}>;
export declare const _Function: Context<{
    Data: Promise<[import("solid-js").Accessor<unknown>, import("solid-js").Setter<unknown>]>;
}>;
declare const _default: {
    Data: Promise<[import("solid-js").Accessor<unknown>, import("solid-js").Setter<unknown>]>;
};
export default _default;
