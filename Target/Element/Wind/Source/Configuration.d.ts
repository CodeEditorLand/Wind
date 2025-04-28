export declare const Render: import("solid-js").Component<{
    propKey: string;
    propSchema: SchemaProperty;
    currentValue: any;
    path: string[];
    onUpdate: (path: string[], value: any) => void;
}>;
export declare const createEffect: typeof import("solid-js").createEffect, createSignal: typeof import("solid-js").createSignal, For: typeof import("solid-js").For, onMount: typeof import("solid-js").onMount, Show: typeof import("solid-js").Show;
export declare const createStore: typeof import("solid-js/store").createStore, produce: typeof import("solid-js/store").produce;
interface SchemaProperty {
    type: string;
    title?: string;
    description?: string;
    default?: any;
    enum?: any[];
    properties?: Record<string, SchemaProperty>;
    items?: SchemaProperty;
}
declare const _default: () => import("solid-js").JSX.Element;
export default _default;
