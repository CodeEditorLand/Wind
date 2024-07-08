import type Items from "../../Interface/Items.js";
import type { Context } from "solid-js";
export type Type = Context<{
    Items: Items;
}>;
export declare const _Function: Context<{
    Items: import("solid-js").Signal<Map<import("../../Interface/Create.js").default, import("./Item.js").Type>>;
}>;
declare const _default: {
    Items: import("solid-js").Signal<Map<import("../../Interface/Create.js").default, import("./Item.js").Type>>;
};
export default _default;
