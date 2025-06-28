var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import { isEditorInput } from "vs/workbench/common/editor.js";
import { isPreferredGroup } from "vs/workbench/services/editor/common/editorGroupFinder.js";
import { HostService } from "Source/Application/Host/Service.js";
import { TextEditorService } from "Source/Application/TextEditor/Service.js";
import { EditorProblem } from "./Error.js";
class EditorService extends Effect.Service()(
  "vscode/EditorService",
  {
    effect: Effect.gen(function* (Generator) {
      const Host = yield* Generator(HostService);
      const TextFileService = yield* Generator(TextEditorService);
      const CreateOpenEditorEffect = /* @__PURE__ */ __name((Editor, _Options, _Group) => Effect.gen(function* (Generator2) {
        const TypedEditor = isEditorInput(Editor) ? Editor : yield* Generator2(
          Effect.tryPromise({
            try: /* @__PURE__ */ __name(() => TextFileService.resolve(Editor), "try"),
            catch: /* @__PURE__ */ __name((Cause) => new EditorProblem({
              Cause,
              Context: "ResolveEditorInputFailed"
            }), "catch")
          })
        );
        const ResourceURI = TypedEditor.resource;
        if (!ResourceURI) {
          return yield* Generator2(
            new EditorProblem({
              Cause: new Error(
                "Editor input lacks a resource URI."
              ),
              Context: "MissingResourceURI"
            })
          );
        }
        yield* Generator2(Host.OpenFile(ResourceURI));
        return void 0;
      }), "CreateOpenEditorEffect");
      const ServiceImplementation = {
        _serviceBrand: void 0,
        openEditor: /* @__PURE__ */ __name((Editor, OptionsOrGroup, Group) => {
          const Options = !isPreferredGroup(OptionsOrGroup) ? OptionsOrGroup : void 0;
          const TargetGroup = isPreferredGroup(OptionsOrGroup) ? OptionsOrGroup : Group;
          return Effect.runPromise(
            CreateOpenEditorEffect(Editor, Options, TargetGroup)
          );
        }, "openEditor"),
        // --- Stubs for other methods and events ---
        // A full implementation would require more complex orchestration Effects
        // and state management for tracking active/visible editors.
        openEditors: /* @__PURE__ */ __name(() => Promise.resolve([]), "openEditors"),
        replaceEditors: /* @__PURE__ */ __name(() => Promise.resolve(), "replaceEditors"),
        save: /* @__PURE__ */ __name(() => Promise.resolve({ success: true, editors: [] }), "save"),
        saveAll: /* @__PURE__ */ __name(() => Promise.resolve({ success: true, editors: [] }), "saveAll"),
        revert: /* @__PURE__ */ __name(() => Promise.resolve({ success: true, editors: [] }), "revert"),
        revertAll: /* @__PURE__ */ __name(() => Promise.resolve({ success: true, editors: [] }), "revertAll"),
        activeEditorPane: void 0,
        activeEditor: void 0,
        count: 0,
        visibleEditorPanes: [],
        visibleEditors: [],
        onDidActiveEditorChange: new Emitter().event,
        onDidVisibleEditorsChange: new Emitter().event,
        onDidCloseEditor: new Emitter().event,
        onDidOpenEditorFail: new Emitter().event,
        onDidMostRecentlyActiveEditorsChange: new Emitter().event
      };
      return ServiceImplementation;
    })
  }
) {
  static {
    __name(this, "EditorService");
  }
}
export {
  EditorService
};
//# sourceMappingURL=Service.js.map
