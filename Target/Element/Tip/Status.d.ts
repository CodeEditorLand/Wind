import "@Stylesheet/Element/Tippy/Dark.scss";
import "@Stylesheet/Element/Tippy/Light.scss";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
export type Property = {
    Class?: string | (() => string);
    ClassButton?: string | (() => string);
};
declare const _default: (Property: Property) => import("solid-js").JSX.Element;
export default _default;
export declare const Merge: <Ts extends readonly unknown[]>(...objects: Ts) => import("deepmerge-ts").DeepMergeHKT<Ts, import("deepmerge-ts").GetDeepMergeFunctionsURIs<{}>, import("deepmerge-ts").DeepMergeBuiltInMetaData>;
