import "@Stylesheet/Element/Tippy/Dark.scss";
import "@Stylesheet/Element/Tippy/Light.scss";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
export type Property = {
    Class?: string | (() => string);
    ClassButton?: string | (() => string);
};
declare const _default: (Property: Property) => Promise<import("solid-js").JSX.Element>;
export default _default;
