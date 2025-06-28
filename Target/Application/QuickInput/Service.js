var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option } from "../../effect";
import { CancellationToken } from "vs/base/common/cancellation.js";
import { HostService } from "Source/Application/Host/Service.js";
import { QuickInputProblem } from "./Error.js";
import {
  ToDTO as QuickPickOptionsToDTO,
  ToDTO as InputBoxOptionsToDTO
} from "Source/TypeConverter/QuickInput.js";
class QuickInputService extends Effect.Service()(
  "quickInputService",
  {
    effect: Effect.gen(function* (Generator) {
      const Host = yield* Generator(HostService);
      const ShowQuickPick = /* @__PURE__ */ __name((Items, Options = {}, Token = CancellationToken.None) => Effect.gen(function* (Generator2) {
        if (Token.isCancellationRequested) {
          return yield* Generator2(Effect.interrupt);
        }
        const ResolvedItems = yield* Generator2(
          Effect.tryPromise({
            try: /* @__PURE__ */ __name(() => Promise.resolve(Items), "try"),
            catch: /* @__PURE__ */ __name((Cause) => new QuickInputProblem({
              Cause,
              Context: "FailedToResolveQuickPickItems"
            }), "catch")
          })
        );
        const DTOs = QuickPickOptionsToDTO(ResolvedItems, Options);
        const ResultHandles = yield* Generator2(
          Host.ShowQuickPick(DTOs).pipe(
            Effect.mapError(
              (Cause) => new QuickInputProblem({
                Cause,
                Context: "ShowQuickPickFailed"
              })
            )
          )
        );
        if (Option.isNone(ResultHandles)) {
          return void 0;
        }
        if (Options.canPickMany) {
          const SelectedIndices = new Set(ResultHandles.value);
          return ResolvedItems.filter(
            (_, Index) => SelectedIndices.has(Index)
          );
        }
        const SingleHandle = ResultHandles.value;
        return ResolvedItems[SingleHandle];
      }), "ShowQuickPick");
      const ShowInputBox = /* @__PURE__ */ __name((Options = {}, Token = CancellationToken.None) => Effect.gen(function* (Generator2) {
        if (Token.isCancellationRequested) {
          return yield* Generator2(Effect.interrupt);
        }
        const OptionsDTO = InputBoxOptionsToDTO(Options);
        return yield* Generator2(
          Host.ShowInputBox(OptionsDTO).pipe(
            Effect.map(Option.getOrUndefined),
            Effect.mapError(
              (Cause) => new QuickInputProblem({
                Cause,
                Context: "ShowInputBoxFailed"
              })
            )
          )
        );
      }), "ShowInputBox");
      const ServiceImplementation = {
        _serviceBrand: void 0,
        pick: /* @__PURE__ */ __name((Picks, Options, Token) => Effect.runPromise(ShowQuickPick(Picks, Options, Token)), "pick"),
        input: /* @__PURE__ */ __name((Options, Token) => Effect.runPromise(ShowInputBox(Options, Token)), "input"),
        createQuickPick: /* @__PURE__ */ __name(() => {
          throw new Error(
            "Stateful QuickPick controllers are not supported in this architecture."
          );
        }, "createQuickPick"),
        createInputBox: /* @__PURE__ */ __name(() => {
          throw new Error(
            "Stateful InputBox controllers are not supported in this architecture."
          );
        }, "createInputBox"),
        // Stubs for remaining properties and methods
        quickAccess: {},
        onDidAccept: new AbortController().signal,
        onDidTriggerButton: new AbortController().signal,
        onDidTriggerItemButton: new AbortController().signal,
        onWillAccept: new Emitter().event,
        onDidChangeValue: new Emitter().event,
        navigate: /* @__PURE__ */ __name(() => {
        }, "navigate"),
        focus: /* @__PURE__ */ __name(() => {
        }, "focus"),
        toggle: /* @__PURE__ */ __name(() => {
        }, "toggle"),
        layout: /* @__PURE__ */ __name(() => {
        }, "layout"),
        show: /* @__PURE__ */ __name(() => {
        }, "show"),
        hide: /* @__PURE__ */ __name(() => {
        }, "hide")
      };
      return ServiceImplementation;
    })
  }
) {
  static {
    __name(this, "QuickInputService");
  }
}
export {
  QuickInputService
};
//# sourceMappingURL=Service.js.map
