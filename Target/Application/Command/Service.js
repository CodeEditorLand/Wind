var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Ref } from "../../effect";
import { IPCService } from "Source/Application/IPC/Service.js";
import { LoggerService } from "Source/Application/Logger/Service.js";
import { WindowService } from "Source/Application/Window/Service.js";
import { CommandProblem } from "./Error.js";
class CommandService extends Effect.Service()(
  "Service/Command",
  {
    effect: Effect.gen(function* (Generator) {
      const IPC = yield* Generator(IPCService);
      const Logger = yield* Generator(LoggerService);
      const Window = yield* Generator(WindowService);
      const Commands = yield* Generator(
        Ref.make(/* @__PURE__ */ new Map())
      );
      const MainThreadProxy = IPC.CreateProxy(
        "$rpc:mainThreadCommands"
      );
      const ExecuteLocalCommand = /* @__PURE__ */ __name((Command, Arguments) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => Promise.resolve(
          Command.Callback.apply(
            Command.ThisArgument,
            Arguments
          )
        ), "try"),
        catch: /* @__PURE__ */ __name((Cause) => new CommandProblem({
          Cause,
          Context: "LocalCommandExecutionFailed"
        }), "catch")
      }), "ExecuteLocalCommand");
      IPC.RegisterInvokeHandler(
        "$executeContributedCommand",
        ([Id, ...Arguments]) => Effect.runPromise(
          Ref.get(Commands).pipe(
            Effect.flatMap(
              (Map2) => Effect.fromNullable(Map2.get(Id))
            ),
            Effect.flatMap(
              (Command) => ExecuteLocalCommand(Command, Arguments)
            ),
            Effect.catchAll(
              (Error2) => Logger.Error(
                `Failed to execute local command '${Id}'`,
                Error2
              ).pipe(Effect.as(void 0))
            )
          )
        )
      );
      const registerCommand = /* @__PURE__ */ __name((Global, Id, Callback, ThisArgument) => {
        const RegistrationEffect = Ref.update(
          Commands,
          (Map2) => Map2.set(Id, { Id, Callback, ThisArgument })
        ).pipe(
          Effect.tap(
            () => Logger.Trace(`Command '${Id}' registered.`)
          )
        );
        Effect.runSync(RegistrationEffect);
        if (Global) {
          MainThreadProxy.$registerCommand(Id);
        }
        return {
          dispose: /* @__PURE__ */ __name(() => {
            const CleanupEffect = Ref.update(
              Commands,
              (Map2) => (Map2.delete(Id), Map2)
            ).pipe(
              Effect.tap(() => {
                if (Global) {
                  MainThreadProxy.$unregisterCommand(Id);
                }
              })
            );
            Effect.runFork(CleanupEffect);
          }, "dispose")
        };
      }, "registerCommand");
      return {
        registerCommand,
        registerTextEditorCommand: /* @__PURE__ */ __name((Id, Callback, ThisArg) => {
          const AdaptedCallback = /* @__PURE__ */ __name((...Arguments) => {
            const ActiveEditor = Window.activeTextEditor;
            if (!ActiveEditor) {
              Effect.runSync(
                Logger.Warn(
                  `Cannot execute text editor command '${Id}' because there is no active text editor.`
                )
              );
              return void 0;
            }
            return ActiveEditor.edit((Builder) => {
              Callback.apply(ThisArg, [
                ActiveEditor,
                Builder,
                ...Arguments
              ]);
            });
          }, "AdaptedCallback");
          return registerCommand(true, Id, AdaptedCallback);
        }, "registerTextEditorCommand"),
        executeCommand: /* @__PURE__ */ __name(async (Id, ...Arguments) => {
          const AllCommands = await Effect.runPromise(
            Ref.get(Commands)
          );
          if (AllCommands.has(Id)) {
            return Effect.runPromise(
              ExecuteLocalCommand(
                AllCommands.get(Id),
                Arguments
              )
            );
          }
          return MainThreadProxy.$executeCommand(
            Id,
            Arguments,
            true
          );
        }, "executeCommand"),
        getCommands: /* @__PURE__ */ __name((FilterInternal = false) => MainThreadProxy.$getCommands(FilterInternal), "getCommands")
      };
    })
  }
) {
  static {
    __name(this, "CommandService");
  }
}
export {
  CommandService
};
//# sourceMappingURL=Service.js.map
