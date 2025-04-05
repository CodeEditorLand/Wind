var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createComponent as _$createComponent } from "solid-js/web";
import Tip from "../Tip.js";
const Fn = /* @__PURE__ */ __name((Event) => {
  try {
    navigator.clipboard.writeText(Event.currentTarget.innerText);
    Event.currentTarget.parentElement._tippy.setContent("Copied!");
  } catch (_Error) {
    console.log(_Error);
  }
}, "Fn");
var Copy_default = /* @__PURE__ */ __name(({
  children: children2
}) => _$createComponent(Tip, {
  Content: "Copy to clipboard.",
  onHidden: /* @__PURE__ */ __name((Instance) => Instance.setContent("Copy to clipboard."), "onHidden"),
  get children() {
    return children2(() => children2);
  }
}), "default");
const {
  children
} = await import("solid-js");
export {
  Fn,
  children,
  Copy_default as default
};
//# sourceMappingURL=Copy.js.map
