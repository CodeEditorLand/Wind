import "@Stylesheet/Element/Button.scss";
export type Fn = HTMLButtonElement | ((Button: HTMLButtonElement) => void);
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
declare const _default: (Property: Property) => Promise<import("solid-js").JSX.Element>;
export default _default;
