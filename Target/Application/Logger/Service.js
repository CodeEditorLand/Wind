var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import {
  LogLevel,
  ILogService as VSCodeLogService
} from "vs/platform/log/common/log.js";
import { HostService } from "../Host/Service.js";
import { HostLogger } from "./HostLogger.js";
class LoggerService extends Effect.Service()(
  "loggerService",
  {
    effect: Effect.gen(function* (Generator) {
      const Host = yield* Generator(HostService);
      const InitialLogLevel = Host.Configuration.logLevel ?? LogLevel.Info;
      const PrimaryLogger = new HostLogger(Host, InitialLogLevel);
      const ServiceInstance = new VSCodeLogService(PrimaryLogger, []);
      return ServiceInstance;
    })
  }
) {
  static {
    __name(this, "LoggerService");
  }
}
export {
  LoggerService
};
//# sourceMappingURL=Service.js.map
