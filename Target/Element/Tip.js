var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { template as _$template } from "solid-js/web";
import { className as _$className } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { use as _$use } from "solid-js/web";
var _tmpl$ = /* @__PURE__ */ _$template(`<div>`);
import "../Stylesheet/Element/Tippy/Dark.scss";
import "../Stylesheet/Element/Tippy/Light.scss";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
var Tip_default = /* @__PURE__ */ __name((Property) => {
  const {
    children: children2,
    Content,
    Class,
    onMount,
    onHidden
  } = Merge({
    children: "",
    Content: "",
    Class: ""
  }, Property);
  let Fn;
  SonMount(() => {
    Tippy(Fn, {
      content: Content ?? "",
      arrow: false,
      inertia: false,
      animation: "shift-away",
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark-border" : "light-border",
      hideOnClick: false,
      onMount: /* @__PURE__ */ __name((instance) => window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({
        matches
      }) => instance.setProps({
        theme: matches ? "dark-border" : "light-border"
      })), "onMount"),
      offset: [0, 5],
      placement: "bottom",
      interactive: true,
      onHidden: /* @__PURE__ */ __name((Instance) => onHidden?.(Instance), "onHidden")
    });
    return onMount?.(Fn);
  });
  return (() => {
    var _el$ = _tmpl$();
    var _ref$ = Fn;
    typeof _ref$ === "function" ? _$use(_ref$, _el$) : Fn = _el$;
    _$insert(_el$, () => children2(() => children2)());
    _$effect(() => _$className(_el$, `Tip ${typeof Class === "function" ? Class() : Class}`.trim()));
    return _el$;
  })();
}, "default");
const {
  default: Merge
} = await import("../Function/Merge.js");
const {
  default: Tippy
} = await import("tippy.js");
const {
  createEffect,
  on,
  children,
  onMount: SonMount
} = await import("solid-js");
export {
  Merge,
  SonMount,
  Tippy,
  children,
  createEffect,
  Tip_default as default,
  on
};
//# sourceMappingURL=Tip.js.map
