import type { Type as Data } from "@Context/Environment/Data";
import type { Context } from "solid-js";
export type Type = Context<{
    Data: Data;
}>;
export declare const _Function: Context<{
    Data: Promise<import("../../Interface/Create").Return<unknown>>;
}>;
declare const _default: {
    Data: Promise<import("../../Interface/Create").Return<unknown>>;
};
export default _default;
