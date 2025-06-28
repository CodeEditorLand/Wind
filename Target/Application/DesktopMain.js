var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Runtime } from "../effect";
import { domContentLoaded } from "vs/base/browser/dom.js";
import { onUnexpectedError } from "vs/base/common/errors.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IProductService } from "vs/platform/product/common/product.js";
import {
  Extensions as QuickAccessExtensions,
  IQuickAccessRegistry
} from "vs/platform/quickinput/common/quickAccess.js";
import { Registry } from "vs/platform/registry/common/platform.js";
import { Workbench } from "vs/workbench/browser/workbench.js";
import { CommandsQuickAccessProvider } from "vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.js";
import { AppLayer } from "./Layer.js";
import { HostService } from "./Host/Service.js";
import { MarkerService } from "./Marker/Service.js";
import { TreeViewService } from "./TreeView/Service.js";
import { NativeTreeViewDataProvider } from "./TreeView/Definition.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
const Main = Effect.gen(function* (Generator) {
  yield* Generator(Effect.promise(() => domContentLoaded(window)));
  yield* Generator(
    Effect.logInfo("DOM content loaded. Initializing services...")
  );
  const Host = yield* Generator(HostService);
  const LogService = yield* Generator(ILogService);
  const Marker = yield* Generator(MarkerService);
  const TreeView = yield* Generator(TreeViewService);
  const Integration = yield* Generator(IntegrationService);
  const MockInstantiationService = {
    createInstance: /* @__PURE__ */ __name((ctor, ...args) => new ctor(...args), "createInstance")
  };
  const InstantiationService = MockInstantiationService;
  yield* Generator(Effect.logInfo("Core services resolved."));
  yield* Generator(Host.ProvideGlobals());
  yield* Generator(Effect.logInfo("Host bridge globals have been provided."));
  yield* Generator(Effect.forkDaemon(Marker.Initialize()));
  yield* Generator(
    Effect.logInfo(
      "MarkerService initialized and listening for diagnostics."
    )
  );
  const QuickAccessRegistry = Registry.as(
    QuickAccessExtensions.Quickaccess
  );
  const CommandsProvider = InstantiationService.createInstance(
    CommandsQuickAccessProvider,
    {}
  );
  QuickAccessRegistry.registerQuickAccessProvider(CommandsProvider);
  yield* Generator(
    Effect.logInfo("Command QuickAccess Provider registered.")
  );
  const ExplorerProvider = new NativeTreeViewDataProvider(
    "workbench.view.explorer",
    Integration,
    LogService
  );
  TreeView.registerTreeDataProvider(
    "workbench.view.explorer",
    ExplorerProvider
  );
  yield* Generator(
    Effect.logInfo("File Explorer native data provider registered.")
  );
  yield* Generator(
    Effect.try({
      try: /* @__PURE__ */ __name(() => {
        const ProductService = {
          _serviceBrand: void 0,
          ...yield * Generator(IProductService)
        };
        const ServiceCollectionBridge = new ServiceCollection(
          [IProductService, ProductService],
          [ILogService, LogService]
        );
        const WorkbenchInstance = new Workbench(
          document.body,
          {},
          // Empty workbench options
          ServiceCollectionBridge
        );
        WorkbenchInstance.startup();
      }, "try"),
      catch: /* @__PURE__ */ __name((error) => {
        onUnexpectedError(error);
        return error;
      }, "catch")
    })
  );
  yield* Generator(Host.NotifyReady());
  yield* Generator(
    Effect.logInfo(
      "Wind Workbench successfully launched and is operational."
    )
  );
  yield* Generator(Effect.never);
}).pipe(
  Effect.catchAllCause(
    (Cause) => Effect.logFatal(
      "A critical error occurred in the main application.",
      Cause
    )
  )
);
const Executable = Main.pipe(Effect.provide(AppLayer), Effect.scoped);
Runtime.runMain(Executable);
//# sourceMappingURL=DesktopMain.js.map
