var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { template as _$template } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /* @__PURE__ */ _$template(`<div class=p-5>`), _tmpl$2 = /* @__PURE__ */ _$template(`<div class="flex flex-col"><main class="flex grow justify-center"><div class="flex grow self-center"><div class=container><div class="grid min-h-screen content-start gap-7 py-9"><div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"><div class="order-last lg:order-first">`);
import { lazy, Suspense } from "solid-js";
const Action = lazy(() => import("../../Context/Action.js"));
const Editor = lazy(() => import("../Editor.js"));
var Editor_default = /* @__PURE__ */ __name(() => _$createComponent(Suspense, {
  get children() {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild;
    _$insert(_el$7, _$createComponent(Suspense, {
      get children() {
        return _$createComponent(Action, {
          get children() {
            return [_$createComponent(Suspense, {
              get children() {
                var _el$8 = _tmpl$();
                _$insert(_el$8, _$createComponent(Editor, {
                  Type: "HTML"
                }));
                return _el$8;
              }
            }), _$createComponent(Suspense, {
              get children() {
                var _el$9 = _tmpl$();
                _$insert(_el$9, _$createComponent(Editor, {
                  Type: "CSS"
                }));
                return _el$9;
              }
            }), _$createComponent(Suspense, {
              get children() {
                var _el$10 = _tmpl$();
                _$insert(_el$10, _$createComponent(Editor, {
                  Type: "TypeScript"
                }));
                return _el$10;
              }
            })];
          }
        });
      }
    }));
    return _el$;
  }
}), "default");
export {
  Editor_default as default
};
//# sourceMappingURL=Editor.js.map
