var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace.js";
import { SCMService as VSCodeSCMService } from "vs/workbench/contrib/scm/common/scmService.js";
import { IntegrationService } from "../../Integration/Tauri/Service.js";
import { FromDTO as ProviderFromDTO } from "../../TypeConverter/SourceControlManagement/Provider.js";
import { SourceControlManagementProblem } from "./Error.js";
class SourceControlManagementService extends Effect.Service()(
  "scmService",
  {
    effect: Effect.gen(function* (Generator) {
      const InstantiationService = yield* Generator(
        IInstantiationService
      );
      const LoggerService = yield* Generator(ILogService);
      const ContextKeyService = yield* Generator(IContextKeyService);
      const WorkspaceContextService = yield* Generator(
        IWorkspaceContextService
      );
      const StorageService = yield* Generator(IStorageService);
      const Integration = yield* Generator(IntegrationService);
      const ServiceInstance = InstantiationService.createInstance(
        VSCodeSCMService,
        ContextKeyService,
        WorkspaceContextService,
        StorageService
      );
      const InitializeState = Integration.Invoke(
        "GetAllSourceControlManagementState"
      ).pipe(
        Effect.tap(
          (State) => LoggerService.trace(
            "[SourceControlManagementService] Received initial SCM state:",
            State
          )
        ),
        Effect.flatMap(
          (State) => Effect.sync(() => {
            for (const ProviderDTO of Object.values(
              State.providers
            )) {
              ServiceInstance.registerSCMProvider(
                ProviderFromDTO(ProviderDTO)
              );
            }
          })
        ),
        Effect.mapError(
          (Cause) => new SourceControlManagementProblem({
            Cause,
            Context: "InitializeStateFailed"
          })
        )
      );
      const ListenForProviderUpdates = Integration.Listen(
        "sky://scm/provider/added",
        (Event) => {
          LoggerService.info(
            `[SourceControlManagementService] SCM Provider added:`,
            Event.payload
          );
          ServiceInstance.registerSCMProvider(
            ProviderFromDTO(Event.payload)
          );
        }
      ).pipe(
        Effect.mapError(
          (Cause) => new SourceControlManagementProblem({
            Cause,
            Context: "ListenForProviderUpdatesFailed"
          })
        )
      );
      const Initialize = Effect.all([
        InitializeState,
        ListenForProviderUpdates
      ]).pipe(Effect.forkDaemon, Effect.asVoid);
      yield* Generator(Initialize);
      return ServiceInstance;
    })
  }
) {
  static {
    __name(this, "SourceControlManagementService");
  }
}
export {
  SourceControlManagementService
};
//# sourceMappingURL=Service.js.map
