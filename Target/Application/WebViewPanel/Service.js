var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Ref } from "../../effect";
import { generateUuid } from "vs/base/common/uuid.js";
import {
  Disposable
} from "vscode";
import { IPCService } from "Source/Application/IPC/Service.js";
import {
  ConvertContentOptionsToDTO,
  ConvertPanelOptionsToDTO,
  ConvertShowOptionsToDTO
} from "Source/TypeConverter/WebView.js";
import { WebViewPanelImplementation } from "./WebViewPanelImplementation.js";
import { WebViewPanelProblem } from "./Error.js";
class WebViewPanelService extends Effect.Service()(
  "Service/WebViewPanel",
  {
    effect: Effect.gen(function* (Generator) {
      const IPC = yield* Generator(IPCService);
      const ActivePanels = yield* Generator(
        Ref.make(/* @__PURE__ */ new Map())
      );
      IPC.RegisterInvokeHandler(
        "$onDidDisposeWebview",
        ([Handle]) => Effect.runPromise(
          Ref.get(ActivePanels).pipe(
            Effect.map((Map2) => Map2.get(Handle)?.dispose())
          )
        )
      );
      IPC.RegisterInvokeHandler(
        "$onDidReceiveMessage",
        ([Handle, Message]) => Effect.runPromise(
          Ref.get(ActivePanels).pipe(
            Effect.map(
              (Map2) => Map2.get(Handle)?.fireDidReceiveMessage(Message)
            )
          )
        )
      );
      IPC.RegisterInvokeHandler(
        "$onDidChangeWebviewPanelViewState",
        ([Handle, NewState]) => Effect.runPromise(
          Ref.get(ActivePanels).pipe(
            Effect.map(
              (Map2) => Map2.get(Handle)?.updateViewState(NewState)
            )
          )
        )
      );
      const CreateWebviewPanel = /* @__PURE__ */ __name((Extension, ViewType, Title, ShowOptions, Options = {}) => Effect.gen(function* (Generator2) {
        const Handle = generateUuid();
        const ViewColumnValue = typeof ShowOptions === "object" ? ShowOptions.viewColumn : ShowOptions;
        const PreserveFocus = typeof ShowOptions === "object" ? !!ShowOptions.preserveFocus : false;
        yield* Generator2(
          IPC.SendRequest("$createWebviewPanel", [
            Handle,
            ViewType,
            Title,
            ConvertShowOptionsToDTO(
              ViewColumnValue,
              PreserveFocus
            ),
            ConvertPanelOptionsToDTO(Options),
            ConvertContentOptionsToDTO(Extension, Options)
          ])
        );
        const Panel = new WebViewPanelImplementation(
          Handle,
          IPC,
          // This should be HostService in a future refactor
          Extension,
          () => Effect.runSync(
            Ref.update(ActivePanels, (Map2) => {
              Map2.delete(Handle);
              return Map2;
            })
          ),
          ViewType,
          Title,
          Options,
          ViewColumnValue
        );
        yield* Generator2(
          Ref.update(
            ActivePanels,
            (Map2) => Map2.set(Handle, Panel)
          )
        );
        return Panel;
      }).pipe(
        Effect.mapError(
          (Cause) => new WebViewPanelProblem({
            Cause,
            Context: "CreateWebviewPanelFailed"
          })
        )
      ), "CreateWebviewPanel");
      return {
        CreateWebviewPanel,
        RegisterWebviewPanelSerializer: /* @__PURE__ */ __name((_Extension, ViewType, _Serializer) => Effect.sync(() => {
          IPC.SendNotification(
            "$registerWebviewPanelSerializer",
            [ViewType, {}]
          );
          return new Disposable(() => {
            IPC.SendNotification(
              "$unregisterWebviewPanelSerializer",
              [ViewType]
            );
          });
        }).pipe(
          Effect.mapError(
            (Cause) => new WebViewPanelProblem({
              Cause,
              Context: "RegisterSerializerFailed"
            })
          )
        ), "RegisterWebviewPanelSerializer")
      };
    })
  }
) {
  static {
    __name(this, "WebViewPanelService");
  }
}
export {
  WebViewPanelService
};
//# sourceMappingURL=Service.js.map
