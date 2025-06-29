var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Ref } from "../../effect";
import {
} from "vscode";
import { FromAPI as RangeFromAPI } from "../../TypeConverter/Main/Range.js";
import { FromAPI as ViewColumnFromAPI } from "../../TypeConverter/Main/ViewColumn.js";
import { CreateEventStream } from "../../Utility/EventStream.js";
import { HostService } from "../Host/Service.js";
import { WorkSpaceService } from "../WorkSpace/Service.js";
import { WindowProblem } from "./Error.js";
class WindowService extends Effect.Service()("Service/Window", {
  effect: Effect.gen(function* (Generator) {
    const Host = yield* Generator(HostService);
    const WorkSpace = yield* Generator(WorkSpaceService);
    const WindowState = yield* Generator(
      Ref.make({ focused: true, active: true })
    );
    const { Event: OnDidChangeWindowState, Fire: FireWindowState } = yield* Generator(CreateEventStream());
    yield* Generator(
      Effect.forkDaemon(
        Host.OnDidChangeWindowState((IsFocused) => {
          const NewState = { focused: IsFocused, active: IsFocused };
          return Ref.set(WindowState, NewState).pipe(
            Effect.andThen(FireWindowState(NewState))
          );
        })
      )
    );
    const ShowTextDocument = /* @__PURE__ */ __name((documentOrUri, columnOrOptions, preserveFocus) => Effect.gen(function* (Generator2) {
      const TheUri = "uri" in documentOrUri ? documentOrUri.uri : documentOrUri;
      const Options = typeof columnOrOptions === "object" ? columnOrOptions : void 0;
      const OptionsDTO = {
        preserveFocus: preserveFocus ?? Options?.preserveFocus,
        selection: Options?.selection ? RangeFromAPI(Options.selection) : void 0
      };
      const ViewColumnDTO = typeof columnOrOptions === "number" ? ViewColumnFromAPI(columnOrOptions) : void 0;
      const EditorId = yield* Generator2(
        Host.ShowTextDocument(TheUri, ViewColumnDTO, OptionsDTO)
      );
      const Editor = WorkSpace.visibleTextEditors.find(
        (e) => e.id === EditorId
      );
      if (!Editor) {
        return yield* Generator2(
          new WindowProblem({
            Cause: `Editor with ID ${EditorId} not found after host confirmation.`,
            Context: "ShowTextDocumentFailed"
          })
        );
      }
      return Editor;
    }), "ShowTextDocument");
    return {
      get state() {
        return Effect.runSync(Ref.get(WindowState));
      },
      onDidChangeWindowState: OnDidChangeWindowState,
      get activeTextEditor() {
        return WorkSpace.activeTextEditor;
      },
      get visibleTextEditors() {
        return WorkSpace.visibleTextEditors;
      },
      ShowTextDocument
    };
  })
}) {
  static {
    __name(this, "WindowService");
  }
}
export {
  WindowService
};
//# sourceMappingURL=Service.js.map
