var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { template as _$template } from "solid-js/web";
import { setAttribute as _$setAttribute } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /* @__PURE__ */ _$template(`<link>`);
import { For, Show } from "solid-js";
var Link_default = /* @__PURE__ */ __name(({
  Of,
  rel,
  type,
  crossorigin
}) => _$createComponent(For, {
  each: Of,
  children: /* @__PURE__ */ __name((Link) => _$createComponent(Show, {
    when: Link,
    get children() {
      return Link && (() => {
        var _el$ = _tmpl$();
        _$setAttribute(_el$, "type", type ?? "text/css");
        _$setAttribute(_el$, "rel", rel ?? "preconnect");
        _$setAttribute(_el$, "crossorigin", crossorigin ?? "anonymous");
        _$setAttribute(_el$, "href", Link);
        return _el$;
      })();
    }
  }), "children")
}), "default");
export {
  Link_default as default
};
//# sourceMappingURL=Link.js.map
