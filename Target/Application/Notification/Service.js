var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { ICommandService } from "vs/platform/commands/common/commands.js";
import { IDialogService } from "vs/platform/dialogs/common/dialogs.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { NotificationService as VSCodeNotificationService } from "vs/workbench/services/notification/common/notificationService.js";
import { HostService } from "../Host/Service.js";
class NotificationService extends Effect.Service()(
  "notificationService",
  {
    effect: Effect.gen(function* (Generator) {
      const StorageService = yield* Generator(IStorageService);
      const DialogService = yield* Generator(IDialogService);
      const CommandService = yield* Generator(ICommandService);
      const Host = yield* Generator(HostService);
      const ServiceInstance = new VSCodeNotificationService(
        StorageService,
        DialogService,
        CommandService
      );
      ServiceInstance.notify = (Notification) => {
        const EffectToRun = Host.ShowNotification(Notification);
        Effect.runFork(EffectToRun);
        return {
          onDidClose: new AbortController().signal,
          onDidChangeVisibility: new AbortController().signal,
          progress: {
            infinite: /* @__PURE__ */ __name(() => {
            }, "infinite"),
            done: /* @__PURE__ */ __name(() => {
            }, "done"),
            total: /* @__PURE__ */ __name(() => {
            }, "total"),
            worked: /* @__PURE__ */ __name(() => {
            }, "worked")
          },
          updateSeverity: /* @__PURE__ */ __name(() => {
          }, "updateSeverity"),
          updateMessage: /* @__PURE__ */ __name(() => {
          }, "updateMessage"),
          updateActions: /* @__PURE__ */ __name(() => {
          }, "updateActions"),
          close: /* @__PURE__ */ __name(() => {
          }, "close")
        };
      };
      ServiceInstance.prompt = (Severity, Message, Choices, Options) => {
        const EffectToRun = Host.ShowPrompt(
          Severity,
          Message,
          Choices,
          Options
        );
        Effect.runFork(EffectToRun);
        return {
          onDidClose: new AbortController().signal,
          onDidChangeVisibility: new AbortController().signal,
          progress: {
            infinite: /* @__PURE__ */ __name(() => {
            }, "infinite"),
            done: /* @__PURE__ */ __name(() => {
            }, "done"),
            total: /* @__PURE__ */ __name(() => {
            }, "total"),
            worked: /* @__PURE__ */ __name(() => {
            }, "worked")
          },
          updateSeverity: /* @__PURE__ */ __name(() => {
          }, "updateSeverity"),
          updateMessage: /* @__PURE__ */ __name(() => {
          }, "updateMessage"),
          updateActions: /* @__PURE__ */ __name(() => {
          }, "updateActions"),
          close: /* @__PURE__ */ __name(() => {
          }, "close")
        };
      };
      ServiceInstance.status = (Message, Options) => {
        const EffectToRun = Host.ShowStatusMessage(Message, Options);
        Effect.runFork(EffectToRun);
        return {
          close: /* @__PURE__ */ __name(() => {
          }, "close")
        };
      };
      return ServiceInstance;
    })
  }
) {
  static {
    __name(this, "NotificationService");
  }
}
export {
  NotificationService
};
//# sourceMappingURL=Service.js.map
