/**
 * @module Editor
 *
 */
declare const _default: ({ Type }?: {
    Type: Editor["Type"];
}) => import("solid-js").JSX.Element;
export default _default;
export type Type = {
    Field: Editor["Type"];
    Content: string;
};
export declare const Return: (Type: Editor["Type"]) => "" | "\n/* Example CSS Code */\nbody {\n\n}\t\t\t\n" | "\n<!-- Example HTML Code -->\n<!doctype html>\n<html lang=\"en\">\n\t<body>\n\t</body>\n</html>\n" | "\n/**\n * Example TypeScript Code\n */\nexport default () => ({});\n";
export declare const Update: SubmitHandler<Type>;
export declare const Action: {
    Editors: import("solid-js").Accessor<unknown>[];
};
export declare const Connection: {
    Messages: import("solid-js").Signal<import("../Context/Connection/Message").Type>;
};
export declare const Store: {
    Items: import("solid-js").Signal<Map<import("../Interface/Create").default, import("../Context/Store/Item").Type>>;
};
export declare const Anchor: (Property: import("@Element/Anchor").Property) => import("solid-js").JSX.Element;
export declare const Button: (Property: import("@Element/Button").Property) => import("solid-js").JSX.Element;
export declare const Tip: ({ children, }: {
    children?: any;
}) => import("solid-js").JSX.Element, Copy: (Event: MouseEvent & {
    currentTarget: HTMLElement;
}) => void;
export declare const Merge: <Ts extends readonly unknown[]>(...objects: Ts) => import("deepmerge-ts").DeepMergeHKT<Ts, import("deepmerge-ts").GetDeepMergeFunctionsURIs<{}>, import("deepmerge-ts").DeepMergeBuiltInMetaData>;
import type Editor from "@Context/Action/Editor";
import type { SubmitHandler } from "@modular-forms/solid";
import "@Stylesheet/Element/Action.scss";
import "@Stylesheet/Element/Editor.scss";
