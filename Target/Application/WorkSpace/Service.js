var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { IFileService } from "vs/platform/files/common/files.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IPolicyService } from "vs/platform/policy/common/policy.js";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity.js";
import { WorkspaceService as VSCodeWorkspaceService } from "vs/workbench/services/configuration/browser/configurationService.js";
import { IConfigurationCache } from "vs/workbench/services/configuration/common/configuration.js";
import { IJSONEditingService } from "vs/workbench/services/configuration/common/jsonEditing.js";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService.js";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService.js";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile.js";
class WorkSpaceService extends Effect.Service()(
  "workspaceContextService",
  {
    effect: Effect.gen(function* (Generator) {
      const EnvironmentService = yield* Generator(
        IBrowserWorkbenchEnvironmentService
      );
      const UserDataProfileService = yield* Generator(
        IUserDataProfileService
      );
      const FileService = yield* Generator(IFileService);
      const RemoteAgentService = yield* Generator(IRemoteAgentService);
      const UriIdentityService = yield* Generator(IUriIdentityService);
      const LoggerService = yield* Generator(ILogService);
      const PolicyService = yield* Generator(IPolicyService);
      const ConfigurationCache = {
        read: /* @__PURE__ */ __name(() => Promise.resolve(""), "read"),
        write: /* @__PURE__ */ __name(() => Promise.resolve(), "write"),
        remove: /* @__PURE__ */ __name(() => Promise.resolve(), "remove"),
        needsCaching: /* @__PURE__ */ __name(() => false, "needsCaching")
      };
      const ServiceInstance = new VSCodeWorkspaceService(
        {
          remoteAuthority: EnvironmentService.remoteAuthority,
          configurationCache: ConfigurationCache
        },
        EnvironmentService,
        UserDataProfileService,
        {},
        // UserDataProfilesService
        FileService,
        RemoteAgentService,
        UriIdentityService,
        LoggerService,
        PolicyService
      );
      return ServiceInstance;
    })
  }
) {
  static {
    __name(this, "WorkSpaceService");
  }
}
export {
  WorkSpaceService
};
//# sourceMappingURL=Service.js.map
