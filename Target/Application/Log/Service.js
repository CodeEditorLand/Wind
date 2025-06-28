var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import {
  ILogService,
  LogLevel,
  LogService as VscLogService
} from "vs/platform/log/common/log.js";
import { HostService } from "Source/Application/Host/Service.js";
import { HostLogger } from "./HostLogger.js";
class LogService extends Effect.Service()("logService", {
  effect: Effect.gen(function* (Generator) {
    const Host = yield* Generator(HostService);
    const InitialLogLevel = Host.Configuration.logLevel ?? LogLevel.Info;
    const PrimaryLogger = new HostLogger(Host, InitialLogLevel);
    const ServiceInstance = new VscLogService(PrimaryLogger, []);
    return ServiceInstance;
  })
}) {
  static {
    __name(this, "LogService");
  }
}
export {
  LogService
};
//# sourceMappingURL=Service.js.map
