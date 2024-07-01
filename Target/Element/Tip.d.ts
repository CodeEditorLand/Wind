import type { Instance } from "tippy.js";
import "@Script/Tippy/Style/Theme/BorderDark.scss";
import "@Script/Tippy/Style/Theme/BorderLight.scss";
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
declare const _default: (Property: Property) => Promise<import("solid-js").JSX.Element>;
export default _default;
