import "@Script/Tippy/Style/Theme/BorderDark.scss";
import "@Script/Tippy/Style/Theme/BorderLight.scss";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
export type Property = {
    Class?: string | (() => string);
    ClassButton?: string | (() => string);
};
declare const _default: (Property: Property) => Promise<import("solid-js").JSX.Element>;
export default _default;
