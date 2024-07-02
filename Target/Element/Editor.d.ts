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
export declare const Return: (Type: Editor["Type"]) => any;
export declare const Update: SubmitHandler<Type>;
export declare const Action: {
    Editors: Type;
};
export declare const Connection: {
    Messages: import("solid-js").Signal<import("../Context/Connection/Message").Type>;
    Socket: import("solid-js").Signal<WebSocket & {
        reconnect: () => void;
    }>;
    State: import("solid-js").Accessor<0 | 2 | 1 | 3>;
    Status: import("solid-js").Signal<Type>;
    States: Type;
};
export declare const Session: {
    Data: import("../Interface/Create").default;
};
export declare const Store: {
    Items: import("../Interface/Items").Type;
};
export declare const Anchor: (Property: import("@Element/Anchor").Property) => import("solid-js").JSX.Element;
export declare const Button: (Property: import("@Element/Button").Property) => Promise<import("solid-js").JSX.Element>;
export declare const Tip: ({ children, }: {
    children?: any;
}) => Promise<import("solid-js").JSX.Element>, Copy: (Event: MouseEvent & {
    currentTarget: HTMLElement;
}) => void;
export declare const Merge: any;
export declare const Wrap: any;
export declare const CSS: any;
export declare const HTML: any;
export declare const TypeScript: any;
import type Editor from "@Context/Action/Editor";
import type { SubmitHandler } from "@modular-forms/solid";
import "@Stylesheet/Element/Action.scss";
import "@Stylesheet/Element/Editor.scss";
