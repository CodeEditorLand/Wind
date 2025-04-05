var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { className as _$className } from "solid-js/web";
import { effect as _$effect } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { use as _$use } from "solid-js/web";
var _tmpl$ = /* @__PURE__ */ _$template(`<button>`);
import Merge from "../Function/Merge.js";
import "../Stylesheet/Element/Anchor.scss";
import { createSignal, children as Show } from "solid-js";
var Anchor_default = /* @__PURE__ */ __name((Property) => {
  const {
    Action,
    Type,
    children,
    Class
  } = Merge({
    children: "",
    Type: "button",
    Action: /* @__PURE__ */ __name(() => {
    }, "Action"),
    Class: ""
  }, Property);
  const [Fn, _Fn] = createSignal();
  return (() => {
    var _el$ = _tmpl$();
    _$use(_Fn, _el$);
    _el$.$$click = () => {
      Action(Fn());
      Fn()?.blur();
    };
    _$setAttribute(_el$, "type", Type);
    _$insert(_el$, () => Show(() => children)());
    _$effect(() => _$className(_el$, `Anchor ${typeof Class === "function" ? Class(Fn()) : Class}`.trim()));
    return _el$;
  })();
}, "default");
_$delegateEvents(["click"]);
export {
  Anchor_default as default
};
//# sourceMappingURL=Anchor.js.map
