var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Ref } from "../../effect";
import { AbstractStorageService } from "vs/platform/storage/common/storageService.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { EffectStorage } from "./Storage.js";
import {
  IUserDataProfile,
  isUserDataProfile
} from "vs/platform/userDataProfile/common/userDataProfile";
import { ILogService } from "vs/platform/log/common/log.js";
class EffectStorageService extends AbstractStorageService {
  constructor(Integration, LogService) {
    super({});
    this.Integration = Integration;
    this.LogService = LogService;
  }
  static {
    __name(this, "EffectStorageService");
  }
  getStorage(scope) {
    return void 0;
  }
  getLogDetails(scope) {
    return `EffectStorage[${scope}]`;
  }
  doInitialize() {
    return Promise.resolve();
  }
  switchToProfile(toProfile, preserveData) {
    this.LogService.info(`Switching to profile: ${toProfile.id}`);
    return Promise.resolve();
  }
  switchToWorkspace(toWorkspace, preserveData) {
    this.LogService.info(`Switching to workspace: ${toWorkspace.id}`);
    return Promise.resolve();
  }
  hasScope(scope) {
    if (isUserDataProfile(scope)) {
      return true;
    }
    return true;
  }
}
class StorageService extends Effect.Service()(
  "storageService",
  {
    effect: Effect.gen(function* (Generator) {
      const Integration = yield* Generator(IntegrationService);
      const LogService = yield* Generator(ILogService);
      const ServiceInstance = new EffectStorageService(
        Integration,
        LogService
      );
      yield* Generator(
        Effect.tryPromise({
          try: /* @__PURE__ */ __name(() => ServiceInstance.initialize(), "try"),
          catch: /* @__PURE__ */ __name((Cause) => new Error("StorageService initialization failed", {
            Cause
          }), "catch")
        })
      );
      return ServiceInstance;
    })
  }
) {
  static {
    __name(this, "StorageService");
  }
}
export {
  StorageService
};
//# sourceMappingURL=Service.js.map
