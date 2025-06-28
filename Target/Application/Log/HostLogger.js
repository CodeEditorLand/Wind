var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import {
  AbstractMessageLogger,
  LogLevel
} from "vs/platform/log/common/log.js";
import { HostService } from "Source/Application/Host/Service.js";
class HostLogger extends AbstractMessageLogger {
  constructor(Host, LogLevel2) {
    super();
    this.Host = Host;
    this.setLevel(LogLevel2);
  }
  static {
    __name(this, "HostLogger");
  }
  log(level, message) {
    const LogEffect = this.Host.Log(level, message).pipe(
      Effect.catchAll(
        (Error2) => (
          // If logging to host fails, fallback to console to not lose the message.
          Effect.sync(
            () => console.error(
              "[HostLogger] Failed to forward log to host:",
              Error2
            )
          )
        )
      )
    );
    Effect.runFork(LogEffect);
  }
  flush() {
  }
}
export {
  HostLogger
};
//# sourceMappingURL=HostLogger.js.map
