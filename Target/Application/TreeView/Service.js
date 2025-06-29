var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IViewsService } from "vs/workbench/common/views.js";
import { IntegrationService } from "../../Integration/Tauri/Service.js";
class NativeTreeViewDataProvider {
  constructor(ViewId, Integration, LoggerService) {
    this.ViewId = ViewId;
    this.Integration = Integration;
    this.LoggerService = LoggerService;
  }
  static {
    __name(this, "NativeTreeViewDataProvider");
  }
  OnDidChangeTreeDataEmitter = new Emitter();
  onDidChangeTreeData = this.OnDidChangeTreeDataEmitter.event;
  getTreeItem(Element) {
    return Element;
  }
  getChildren(Element) {
    this.LoggerService.trace(
      `[NativeTreeViewDataProvider] Getting children for view '${this.ViewID}'`,
      Element
    );
    const GetChildrenEffect = this.Integration.Invoke(
      "GetTreeViewChildren",
      {
        ViewID: this.ViewId,
        ElementHandle: Element?.handle
      }
    ).pipe(
      Effect.catchAll((Cause) => {
        this.LoggerService.error(
          `[NativeTreeViewDataProvider] Failed to get children for ${this.ViewId}:`,
          Cause
        );
        return Effect.succeed([]);
      })
    );
    return Effect.runPromise(GetChildrenEffect);
  }
}
class TreeViewService extends Effect.Service()(
  "viewsService",
  {
    effect: Effect.gen(function* (Generator) {
      const ViewsService = yield* Generator(IViewsService);
      const LoggerService = yield* Generator(ILogService);
      const registerTreeDataProvider = /* @__PURE__ */ __name((viewId, provider) => {
        LoggerService.info(
          `[TreeViewService] Registering tree data provider for view: ${viewId}`
        );
        return ViewsService.registerTreeDataProvider(
          viewId,
          provider
        );
      }, "registerTreeDataProvider");
      return { registerTreeDataProvider };
    })
  }
) {
  static {
    __name(this, "TreeViewService");
  }
}
export {
  NativeTreeViewDataProvider,
  TreeViewService
};
//# sourceMappingURL=Service.js.map
