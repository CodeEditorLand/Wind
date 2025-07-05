/**
 * @module HostLogger (Application/Logger)
 * @description Defines a custom `ILogger` implementation that forwards all
 * log messages to the native host via the `HostService`.
 */
import { AbstractMessageLogger, type ILogger } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { HostService } from "../Host/Service.js";
/**
 * An `ILogger` implementation that sends log messages to the host process.
 * It formats messages and uses the `HostService` to transmit them.
 */
export declare class HostLogger extends AbstractMessageLogger implements ILogger {
    private readonly Host;
    constructor(Host: HostService, LogLevel: LogLevel);
    protected log(level: LogLevel, message: string): void;
    flush(): void;
}
//# sourceMappingURL=HostLogger.d.ts.map