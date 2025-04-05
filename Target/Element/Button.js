var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { className as _$className } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
var _tmpl$ = /* @__PURE__ */ _$template(`<button>`);
import "../Stylesheet/Element/Button.scss";
var Button_default = /* @__PURE__ */ __name((Property) => {
  const {
    Action,
    Type,
    children: children2,
    Class,
    Label
  } = Merge({
    children: "",
    Type: "button",
    // biome-ignore lint/suspicious/noEmptyBlockStatements:
    Action: /* @__PURE__ */ __name(() => {
    }, "Action"),
    Class: "",
    Label: ""
  }, Property);
  return (() => {
    var _el$ = _tmpl$();
    _el$.$$click = () => {
      Action(Property.Fn);
      Property.Fn?.blur();
    };
    _$setAttribute(_el$, "type", Type);
    _$setAttribute(_el$, "aria-label", Label);
    _$insert(_el$, () => children2(() => children2)());
    _$effect(() => _$className(_el$, `Button ${typeof Class === "function" ? Class(Property.Fn) : Class}`.trim()));
    return _el$;
  })();
}, "default");
const {
  children
} = await import("solid-js");
const {
  default: Merge
} = await import("../Function/Merge.js");
_$delegateEvents(["click"]);
export {
  Merge,
  children,
  Button_default as default
};
//# sourceMappingURL=Button.js.map
