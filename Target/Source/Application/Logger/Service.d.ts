/**
 * @module Service (Application/Logger)
 * @description Defines the service interface and live implementation for the
 * `ILogService`, which provides logging capabilities to the application.
 */
import { Effect } from "effect";
declare const LoggerService_base: Effect.Service.Class<VSCodeLogService, "loggerService", {
    readonly effect: Effect.Effect<any, never, import("../Host/Service.js").Host>;
}>;
/**
 * The `Effect.Service` for the `ILogService`.
 *
 * This service implementation "lifts" the original `LoggerService` class from
 * VS Code. It instantiates it with a custom `HostLogger`, which acts as the
 * primary logger. The `HostLogger` forwards all log messages to the native
 * `Mountain` host via the `HostService`. This ensures that all workbench logs
 * are centrally managed by the native backend.
 */
export declare class LoggerService extends LoggerService_base {
}
export {};
//# sourceMappingURL=Service.d.ts.map