var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../effect";
import { domContentLoaded } from "vs/base/browser/dom.js";
import { onUnexpectedError } from "vs/base/common/errors.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IProductService } from "vs/platform/product/common/productService.js";
import {
  Extensions as QuickAccessExtensions
} from "vs/platform/quickinput/common/quickAccess.js";
import { Registry } from "vs/platform/registry/common/platform.js";
import { Workbench } from "vs/workbench/browser/workbench.js";
import { CommandsQuickAccessProvider } from "vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.js";
import { IntegrationService } from "../Integration/Tauri/Service.js";
import { HostService } from "./Host/Service.js";
import { AppLayer } from "./Layer.js";
import { MarkerService } from "./Marker/Service.js";
import {
  NativeTreeViewDataProvider,
  TreeViewService
} from "./TreeView/Service.js";
const Main = Effect.gen(function* () {
  yield* Effect.promise(() => domContentLoaded(window));
  yield* Effect.logInfo("DOM content loaded. Initializing services...");
  const Host = yield* HostService;
  const LoggerService = yield* ILogService;
  const Marker = yield* MarkerService;
  const TreeView = yield* TreeViewService;
  const Integration = yield* IntegrationService;
  const MockInstantiationService = {
    createInstance: /* @__PURE__ */ __name((ctor, ...args) => new ctor(...args), "createInstance")
  };
  const InstantiationService = MockInstantiationService;
  yield* Effect.logInfo("Core services resolved.");
  yield* Host.ProvideGlobals();
  yield* Effect.logInfo("Host bridge globals have been provided.");
  yield* Effect.forkDaemon(Marker.Initialize());
  yield* Effect.logInfo(
    "MarkerService initialized and listening for diagnostics."
  );
  const QuickAccessRegistry = Registry.as(
    QuickAccessExtensions.Quickaccess
  );
  const CommandsProvider = InstantiationService.createInstance(
    CommandsQuickAccessProvider,
    {}
  );
  QuickAccessRegistry.registerQuickAccessProvider({
    ctor: /* @__PURE__ */ __name(function(...args) {
      return new CommandsQuickAccessProvider(...args);
    }, "ctor"),
    prefix: CommandsQuickAccessProvider.PREFIX,
    helpEntries: []
  });
  yield* Effect.logInfo("Command QuickAccess Provider registered.");
  const ExplorerProvider = new NativeTreeViewDataProvider(
    "workbench.view.explorer",
    Integration,
    LoggerService
  );
  TreeView.registerTreeDataProvider(
    "workbench.view.explorer",
    ExplorerProvider
  );
  yield* Effect.logInfo("File Explorer native data provider registered.");
  yield* Effect.try({
    try: /* @__PURE__ */ __name(() => {
      const ProductService = {
        _serviceBrand: void 0,
        ...Effect.runSync(IProductService)
      };
      const ServiceCollectionBridge = new ServiceCollection(
        [IProductService, ProductService],
        [ILogService, LoggerService]
      );
      const WorkbenchInstance = InstantiationService.createInstance(
        Workbench,
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
  });
  yield* Host.NotifyReady();
  yield* Effect.logInfo(
    "Wind Workbench successfully launched and is operational."
  );
  yield* Effect.never;
}).pipe(
  Effect.catchAllCause(
    (Cause) => Effect.logFatal(
      "A critical error occurred in the main application.",
      Cause
    )
  )
);
const Executable = Main.pipe(Effect.provide(AppLayer), Effect.scoped);
Effect.runFork(Executable);
//# sourceMappingURL=DesktopMain.js.map
