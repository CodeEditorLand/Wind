var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { ILogService } from "vs/platform/log/common/log.js";
import {
  AbstractStorageService
} from "vs/platform/storage/common/storage.js";
import {
  isUserDataProfile
} from "vs/platform/userDataProfile/common/userDataProfile";
import { IntegrationService } from "../../Integration/Tauri/Service.js";
class EffectStorageService extends AbstractStorageService {
  constructor(Integration, LoggerService) {
    super({
      flushInterval: 0
    });
    this.Integration = Integration;
    this.LoggerService = LoggerService;
  }
  static {
    __name(this, "EffectStorageService");
  }
  getStorage(_scope) {
    return void 0;
  }
  getLogDetails(scope) {
    return `EffectStorage[${scope}]`;
  }
  doInitialize() {
    return Promise.resolve();
  }
  switchToProfile(toProfile, _preserveData) {
    this.LoggerService.info(`Switching to profile: ${toProfile.id}`);
    return Promise.resolve();
  }
  switchToWorkspace(toWorkspace, _preserveData) {
    this.LoggerService.info(`Switching to workspace: ${toWorkspace.id}`);
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
      const LoggerService = yield* Generator(ILogService);
      const ServiceInstance = new EffectStorageService(
        Integration,
        LoggerService
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
  EffectStorageService,
  StorageService
};
//# sourceMappingURL=Service.js.map
