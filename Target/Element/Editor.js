var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { spread as _$spread } from "solid-js/web";
import { mergeProps as _$mergeProps } from "solid-js/web";
import { memo as _$memo } from "solid-js/web";
import { use as _$use } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
var _tmpl$ = /* @__PURE__ */ _$template(`<div>`), _tmpl$2 = /* @__PURE__ */ _$template(`<div class=w-full><div class=Editor><code class=Monaco></code><input>`), _tmpl$3 = /* @__PURE__ */ _$template(`<div class=Error><span>&nbsp;&nbsp;&nbsp;`), _tmpl$4 = /* @__PURE__ */ _$template(`<input type=hidden>`);
import { clearError, createForm, required, validate } from "@modular-forms/solid";
import { editor as Monaco } from "monaco-editor";
import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import "../Stylesheet/Element/Action.scss";
import "../Stylesheet/Element/Editor.scss";
var Editor_default = /* @__PURE__ */ __name(({
  Type
} = {
  Type: "HTML"
}) => {
  const [Edit, {
    Form,
    Field
  }] = createForm();
  const Content = createSignal(Return(Type));
  let Code;
  let Instance;
  onMount(() => {
    console.log(Code);
    if (Code instanceof HTMLElement) {
      Instance = Monaco.create(Code, {
        value: Content[0](),
        language: Type.toLowerCase(),
        automaticLayout: true,
        lineNumbers: "off",
        "semanticHighlighting.enabled": "configuredByTheme",
        autoClosingBrackets: "always",
        autoIndent: "full",
        tabSize: 4,
        detectIndentation: false,
        useTabStops: true,
        minimap: {
          enabled: false
        },
        scrollbar: {
          useShadows: true,
          horizontal: "hidden",
          verticalScrollbarSize: 10,
          verticalSliderSize: 4,
          alwaysConsumeMouseWheel: false
        },
        folding: false,
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light",
        wrappingStrategy: "advanced",
        // TODO: UNCOMMENT
        // word: "on",
        bracketPairColorization: {
          enabled: true,
          independentColorPoolPerBracketType: true
        },
        padding: {
          top: 12,
          bottom: 12
        },
        fixedOverflowWidgets: true,
        tabCompletion: "on",
        acceptSuggestionOnEnter: "on",
        cursorWidth: 5,
        roundedSelection: true,
        matchBrackets: "always",
        autoSurround: "languageDefined",
        screenReaderAnnounceInlineSuggestion: false,
        renderFinalNewline: "on",
        selectOnLineNumbers: false,
        formatOnType: true,
        formatOnPaste: true,
        fontFamily: "'Source Code Pro'",
        fontWeight: "400",
        fontLigatures: true,
        links: false,
        fontSize: 16
      });
      Instance.getModel()?.setEOL(Monaco.EndOfLineSequence.LF);
      Instance.onKeyDown((Event) => {
        if (Event.ctrlKey && Event.code === "KeyS") {
          Event.preventDefault();
          validate(Edit);
          Edit.element?.submit();
        }
      });
      Instance.onDidChangeModelLanguageConfiguration(() => Instance.getAction("editor.action.formatDocument")?.run());
      Instance.onDidLayoutChange(() => Instance.getAction("editor.action.formatDocument")?.run());
      window.addEventListener("load", () => Instance.getAction("editor.action.formatDocument")?.run());
      setTimeout(() => Instance.getAction("editor.action.formatDocument")?.run(), 1e3);
      createEffect(on(Content[0], (Content2) => Instance.getModel()?.setValue(Content2), {
        defer: false
      }));
    }
  });
  onCleanup(() => {
    console.log(Code);
    console.log(2);
  });
  return (
    // TODO: UNCOMMENT
    // class={
    // 	Action.Editors[0]()?.get(Identifier)?.Hidden ? "hidden" : ""
    // }
    (() => {
      var _el$ = _tmpl$();
      _$insert(_el$, _$createComponent(Form, {
        method: "post",
        onSubmit: Update,
        get children() {
          return [_$createComponent(Field, {
            name: "Content",
            get validate() {
              return [required(`Please enter some ${Type}.`)];
            },
            children: /* @__PURE__ */ __name((Field2, Property) => (() => {
              var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling;
              var _ref$ = Code;
              typeof _ref$ === "function" ? _$use(_ref$, _el$4) : Code = _el$4;
              _$insert(_el$3, (() => {
                var _c$ = _$memo(() => !!Field2.error);
                return () => _c$() && (() => {
                  var _el$6 = _tmpl$3(), _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild;
                  _el$6.$$click = () => {
                    clearError(Edit, "Content");
                    Instance.focus();
                  };
                  _$insert(_el$7, () => Field2.error, null);
                  return _el$6;
                })();
              })(), _el$5);
              _$spread(_el$5, _$mergeProps(Property, {
                "type": "hidden",
                "required": true
              }), false, false);
              return _el$2;
            })(), "children")
          }), _$createComponent(Field, {
            name: "Field",
            children: /* @__PURE__ */ __name((_Field, Property) => (() => {
              var _el$9 = _tmpl$4();
              _$spread(_el$9, _$mergeProps(Property, {
                "value": Type
              }), false, false);
              return _el$9;
            })(), "children")
          })];
        }
      }));
      return _el$;
    })()
  );
}, "default");
const Return = /* @__PURE__ */ __name((Type) => {
  switch (Type) {
    case "CSS":
      return `
/* Example CSS Code */
body {

}			
`;
    case "HTML":
      return `
<!-- Example HTML Code -->
<!doctype html>
<html lang="en">
	<body>
	</body>
</html>
`;
    case "TypeScript":
      return `
/**
 * Example TypeScript Code
 */
export default () => ({});
`;
    default:
      return "";
  }
}, "Return");
const Update = /* @__PURE__ */ __name(({
  Content,
  Field
}, Event) => {
  if (Event) {
    Event.preventDefault();
  }
}, "Update");
_$delegateEvents(["click"]);
export {
  Return,
  Update,
  Editor_default as default
};
//# sourceMappingURL=Editor.js.map
