var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { template as _$template } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /* @__PURE__ */ _$template(`<link rel=stylesheet media=print href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&amp;display=swap">`);
self.MonacoEnvironment = {
  createTrustedTypesPolicy: /* @__PURE__ */ __name(() => void 0, "createTrustedTypesPolicy"),
  getWorker: /* @__PURE__ */ __name(async (_WorkerID, Label) => {
    switch (Label) {
      case "css":
        return new (await import(
          // @ts-expect-error
          "monaco-editor/esm/vs/language/css/css.worker?worker"
        )).default();
      case "html":
        return new (await import(
          // @ts-expect-error
          "monaco-editor/esm/vs/language/html/html.worker?worker"
        )).default();
      case "typescript":
        return new (await import(
          // @ts-expect-error
          "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
        )).default();
      default:
        return new (await import(
          // @ts-expect-error
          "monaco-editor/esm/vs/editor/editor.worker?worker"
        )).default();
    }
  }, "getWorker")
};
var Action_default = /* @__PURE__ */ __name(({
  children
}) => _$createComponent(_Function.Provider, {
  get value() {
    return _Function.defaultValue;
  },
  get children() {
    return [(() => {
      var _el$ = _tmpl$();
      _el$.addEventListener("load", (Event) => {
        Event.target.removeAttribute("onload");
        Event.target.removeAttribute("media");
      });
      return _el$;
    })(), children];
  }
}), "default");
const {
  editor: Monaco,
  languages
} = await import("monaco-editor");
languages.typescript.typescriptDefaults.setEagerModelSync(true);
Monaco.defineTheme("Light", (await import("../Script/Monaco/Theme/Active4D.json")).default);
Monaco.defineTheme("Dark", (await import("../Script/Monaco/Theme/Amoled.json")).default);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({
  matches
}) => Monaco.setTheme(matches ? "Dark" : "Light"));
const {
  _Function
} = await import("./Action/Context.js");
export {
  Monaco,
  _Function,
  Action_default as default,
  languages
};
//# sourceMappingURL=Action.js.map
