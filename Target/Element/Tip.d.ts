import type { Instance } from "tippy.js";
import "@Stylesheet/Element/Tippy/Dark.scss";
import "@Stylesheet/Element/Tippy/Light.scss";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
export type Tip = HTMLDivElement & {
    _tippy: Instance;
};
export type Property = {
    children?: any;
    Content?: string;
    onMount?: (Tip: Tip) => void;
    onHidden?: (Instance: Instance) => void;
    Class?: string | (() => string);
};
declare const _default: (Property: Property) => import("solid-js").JSX.Element;
export default _default;
export declare const Merge: <Ts extends readonly unknown[]>(...objects: Ts) => import("deepmerge-ts").DeepMergeHKT<Ts, import("deepmerge-ts").GetDeepMergeFunctionsURIs<{}>, import("deepmerge-ts").DeepMergeBuiltInMetaData>;
export declare const Tippy: import("tippy.js").Tippy<import("tippy.js").Props>;
export declare const createEffect: typeof import("solid-js").createEffect, on: typeof import("solid-js").on, children: typeof import("solid-js").children, SonMount: typeof import("solid-js").onMount;
