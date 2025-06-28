var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Ref } from "../../effect";
import { generateUuid } from "vs/base/common/uuid.js";
import {
  Disposable,
  StatusBarAlignment
} from "vscode";
import { CommandService } from "Source/Application/Command/Service.js";
import { HostService } from "Source/Application/Host/Service.js";
import { StatusBarItemImplementation } from "./StatusBarItem.js";
import { StatusBarProblem } from "./Error.js";
class StatusBarService extends Effect.Service()(
  "statusbarService",
  {
    effect: Effect.gen(function* (Generator) {
      const Host = yield* Generator(HostService);
      const Command = yield* Generator(CommandService);
      const ActiveItems = yield* Generator(
        Ref.make(/* @__PURE__ */ new Map())
      );
      const CreateStatusBarItem = /* @__PURE__ */ __name((Extension, Id, Alignment, Priority) => Effect.sync(() => {
        const EntryId = generateUuid();
        const ItemId = Id ?? `${Extension.identifier.value}.${EntryId}`;
        const FinalAlignment = Alignment ?? StatusBarAlignment.Left;
        const OnDispose = /* @__PURE__ */ __name(() => Effect.runSync(
          Ref.update(ActiveItems, (Map2) => {
            Map2.delete(EntryId);
            return Map2;
          })
        ), "OnDispose");
        const Entry = new StatusBarItemImplementation(
          EntryId,
          Extension,
          Host,
          Command,
          OnDispose,
          ItemId,
          FinalAlignment,
          Priority
        );
        Effect.runSync(
          Ref.update(
            ActiveItems,
            (Map2) => Map2.set(EntryId, Entry)
          )
        );
        return Entry;
      }), "CreateStatusBarItem");
      const SetStatusBarMessage = /* @__PURE__ */ __name((Text, HideOrPromise) => {
        const HideId = `status.message.${generateUuid()}`;
        const ShowEffect = Host.SetStatusBarMessage(HideId, Text);
        const HideEffect = Host.DisposeStatusBarMessage(HideId);
        Effect.runFork(ShowEffect);
        if (typeof HideOrPromise === "number") {
          setTimeout(() => Effect.runFork(HideEffect), HideOrPromise);
        } else if (HideOrPromise) {
          Promise.resolve(HideOrPromise).finally(
            () => Effect.runFork(HideEffect)
          );
        }
        return new Disposable(() => Effect.runFork(HideEffect));
      }, "SetStatusBarMessage");
      const ServiceImplementation = {
        addEntry: /* @__PURE__ */ __name((Properties, Id, Alignment, Priority) => {
          const Item = Effect.runSync(
            CreateStatusBarItem(
              { id: Id, name: Properties.name },
              // DTO mapping needed
              Id,
              Alignment,
              Priority
            )
          );
          Item.text = Properties.text;
          Item.tooltip = Properties.tooltip;
          Item.command = Properties.command;
          Item.show();
          return {
            update: /* @__PURE__ */ __name((p) => Object.assign(Item, p), "update"),
            dispose: /* @__PURE__ */ __name(() => Item.dispose(), "dispose")
          };
        }, "addEntry"),
        // Stubs for other methods
        getPart: /* @__PURE__ */ __name(() => ({}), "getPart"),
        createAuxiliaryStatusbarPart: /* @__PURE__ */ __name(() => ({}), "createAuxiliaryStatusbarPart"),
        createScoped: /* @__PURE__ */ __name(() => ({}), "createScoped")
      };
      return ServiceImplementation;
    })
  }
) {
  static {
    __name(this, "StatusBarService");
  }
}
export {
  StatusBarService
};
//# sourceMappingURL=Service.js.map
