import "@Stylesheet/Element/Button.scss";
export type Fn = HTMLButtonElement;
export interface Property {
    children?: any;
    Type?: "submit" | "reset" | "button";
    Action?: (Fn?: Fn) => void;
    Class?: string | ((Fn?: Fn) => string);
    Label?: string;
    Fn?: Fn;
}
export type Concrete<Type> = {
    [Key in keyof Type]-?: Type[Key];
};
declare const _default: (Property: Property) => import("solid-js").JSX.Element;
export default _default;
export declare const children: typeof import("solid-js").children;
export declare const Merge: <Ts extends readonly unknown[]>(...objects: Ts) => import("deepmerge-ts").DeepMergeHKT<Ts, import("deepmerge-ts").GetDeepMergeFunctionsURIs<{}>, import("deepmerge-ts").DeepMergeBuiltInMetaData>;
