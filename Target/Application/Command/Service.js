var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Ref } from "../../effect";
import { IPCService } from "../IPC/Service.js";
import { LoggerService } from "../Logger/Service.js";
import { WindowService } from "../Window/Service.js";
import { CommandProblem } from "./Error.js";
class CommandService extends Effect.Service()(
  "Service/Command",
  {
    effect: Effect.gen(function* () {
      const IPC = yield* IPCService;
      const Logger = yield* LoggerService;
      const Window = yield* WindowService;
      const Commands = yield* Ref.make(
        /* @__PURE__ */ new Map()
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
        ([Id, ...Arguments]) => {
          const handlerEffect = Ref.get(Commands).pipe(
            Effect.flatMap(
              (Map2) => Effect.fromNullable(Map2.get(Id))
            ),
            Effect.flatMap(
              (Command) => ExecuteLocalCommand(Command, Arguments)
            ),
            Effect.catchAll(
              (error) => Effect.sync(
                () => Logger.error(
                  `Failed to execute local command '${Id}'`,
                  error
                )
              ).pipe(Effect.as(void 0))
            )
          );
          return Effect.runPromise(handlerEffect);
        }
      );
      const self = {
        registerCommand: /* @__PURE__ */ __name((Global, Id, Callback, ThisArgument) => {
          const RegistrationEffect = Ref.update(
            Commands,
            (Map2) => Map2.set(Id, { Id, Callback, ThisArgument })
          ).pipe(
            Effect.tap(
              () => Effect.sync(
                () => Logger.trace(`Command '${Id}' registered.`)
              )
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
        }, "registerCommand"),
        registerTextEditorCommand: /* @__PURE__ */ __name((Id, Callback, ThisArg) => {
          const AdaptedCallback = /* @__PURE__ */ __name((...Arguments) => {
            const ActiveEditor = Window.activeTextEditor;
            if (!ActiveEditor) {
              Effect.runSync(
                Effect.sync(
                  () => Logger.warn(
                    `Cannot execute text editor command '${Id}' because there is no active text editor.`
                  )
                )
              );
              return Promise.resolve(void 0);
            }
            return ActiveEditor.edit((Builder) => {
              Callback.apply(ThisArg, [
                ActiveEditor,
                Builder,
                ...Arguments
              ]);
            });
          }, "AdaptedCallback");
          return self.registerCommand(true, Id, AdaptedCallback);
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
      return self;
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
