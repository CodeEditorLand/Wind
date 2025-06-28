var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Ref } from "../../effect";
import {
  Disposable
} from "vscode";
import { IPCService } from "Source/Application/IPC/Service.js";
import { CreateEventStream } from "Source/Utility/CreateEventStream.js";
import {
  DebugProviderRegistrationProblem,
  StartDebuggingProblem
} from "./Error.js";
class DebugService extends Effect.Service()("Service/Debug", {
  effect: Effect.gen(function* (Generator) {
    const IPC = yield* Generator(IPCService);
    const HandleCounter = { current: 0 };
    const State = yield* Generator(
      Ref.make({
        ActiveDebugSession: void 0,
        ActiveDebugConsole: { append: /* @__PURE__ */ __name(() => {
        }, "append"), appendLine: /* @__PURE__ */ __name(() => {
        }, "appendLine") },
        Breakpoints: [],
        DebugConfigurationProviders: /* @__PURE__ */ new Map(),
        DebugAdapterDescriptorFactories: /* @__PURE__ */ new Map(),
        DebugAdapterTrackerFactories: /* @__PURE__ */ new Map()
      })
    );
    const MainThreadProxy = IPC.CreateProxy(
      "$rpc:mainThreadDebug"
    );
    const { event: OnDidChangeActiveDebugSession } = CreateEventStream();
    const { event: OnDidStartDebugSession } = CreateEventStream();
    const { event: OnDidReceiveDebugSessionCustomEvent } = CreateEventStream();
    const { event: OnDidTerminateDebugSession } = CreateEventStream();
    const { event: OnDidChangeBreakpoints } = CreateEventStream();
    const RegisterProvider = /* @__PURE__ */ __name((Registry, Data) => Effect.gen(function* (Generator2) {
      const Handle = ++HandleCounter.current;
      yield* Generator2(
        Ref.update(Registry, (Map2) => Map2.set(Handle, Data))
      );
      yield* Generator2(
        IPC.SendNotification("$registerDebugTypes", [Data.Type])
      );
      const CleanupEffect = Ref.update(
        Registry,
        (Map2) => (Map2.delete(Handle), Map2)
      ).pipe(
        Effect.andThen(
          IPC.SendNotification("$unregisterDebugTypes", [
            Data.Type
          ])
        )
      );
      return new Disposable(() => Effect.runFork(CleanupEffect));
    }).pipe(
      Effect.mapError(
        (Cause) => new DebugProviderRegistrationProblem({
          DebugType: Data.Type,
          Cause
        })
      )
    ), "RegisterProvider");
    const GetState = /* @__PURE__ */ __name(() => Effect.runSync(Ref.get(State)), "GetState");
    return {
      get activeDebugSession() {
        return GetState().ActiveDebugSession;
      },
      get activeDebugConsole() {
        return GetState().ActiveDebugConsole;
      },
      get breakpoints() {
        return GetState().Breakpoints;
      },
      onDidChangeActiveDebugSession,
      onDidStartDebugSession,
      onDidReceiveDebugSessionCustomEvent,
      onDidTerminateDebugSession,
      onDidChangeBreakpoints,
      registerDebugConfigurationProvider: /* @__PURE__ */ __name((Type, Provider, _Trigger, Extension) => RegisterProvider(
        GetState().DebugConfigurationProviders,
        { Type, Provider, Extension }
      ), "registerDebugConfigurationProvider"),
      registerDebugAdapterDescriptorFactory: /* @__PURE__ */ __name((Type, Factory, Extension) => RegisterProvider(
        GetState().DebugAdapterDescriptorFactories,
        { Type, Provider: Factory, Extension }
      ), "registerDebugAdapterDescriptorFactory"),
      registerDebugAdapterTrackerFactory: /* @__PURE__ */ __name((Type, Factory, Extension) => RegisterProvider(
        GetState().DebugAdapterTrackerFactories,
        { Type, Provider: Factory, Extension }
      ), "registerDebugAdapterTrackerFactory"),
      startDebugging: /* @__PURE__ */ __name((Folder, NameOrConfiguration, Options) => Effect.gen(function* (Generator2) {
        const ConfigurationDTO = typeof NameOrConfiguration === "string" ? { name: NameOrConfiguration } : NameOrConfiguration;
        const OptionsDTO = {
          parentSession: Options?.parentSession?.id,
          lifecycleManagedByParent: Options?.lifecycleManagedByParent
        };
        return yield* Generator2(
          MainThreadProxy.$startDebugging(
            Folder?.uri,
            ConfigurationDTO,
            OptionsDTO
          )
        );
      }).pipe(
        Effect.mapError(
          (Cause) => new StartDebuggingProblem({ Cause })
        )
      ), "startDebugging"),
      stopDebugging: /* @__PURE__ */ __name((Session) => Effect.gen(function* (Generator2) {
        const ActiveSession = GetState().ActiveDebugSession;
        const SessionToStop = Session ?? ActiveSession;
        if (!SessionToStop) {
          return;
        }
        yield* Generator2(
          MainThreadProxy.$stopDebugging(SessionToStop.id)
        );
      }), "stopDebugging"),
      addBreakpoints: /* @__PURE__ */ __name((Breakpoints) => Effect.sync(
        () => MainThreadProxy.$addBreakpoints(Breakpoints)
      ), "addBreakpoints"),
      removeBreakpoints: /* @__PURE__ */ __name((Breakpoints) => Effect.sync(
        () => MainThreadProxy.$removeBreakpoints(Breakpoints)
      ), "removeBreakpoints")
    };
  })
}) {
  static {
    __name(this, "DebugService");
  }
}
export {
  DebugService
};
//# sourceMappingURL=Service.js.map
