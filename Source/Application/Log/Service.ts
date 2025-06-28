/**
 * @module Service (Application/Log)
 * @description Defines the service interface and live implementation for the
 * `ILogService`, which provides logging capabilities to the application.
 */

import { Effect } from "effect";
import {
	ILogService,
	LogLevel,
	LogService as VscLogService,
} from "vs/platform/log/common/log.js";
import { HostService } from "Source/Application/Host/Service.js";
import { HostLogger } from "./HostLogger.js";

/**
 * The `Effect.Service` for the `ILogService`.
 *
 * This service implementation "lifts" the original `LogService` class from
 * VS Code. It instantiates it with a custom `HostLogger`, which acts as the
 * primary logger. The `HostLogger` forwards all log messages to the native
 * `Mountain` host via the `HostService`. This ensures that all workbench logs
 * are centrally managed by the native backend.
 */
export class LogService extends Effect.Service<ILogService>()("logService", {
	effect: Effect.gen(function* (Generator) {
		const Host = yield* Generator(HostService);

		// The log level is sourced from the initial configuration provided by the host.
		const InitialLogLevel = Host.Configuration.logLevel ?? LogLevel.Info;
		const PrimaryLogger = new HostLogger(Host, InitialLogLevel);

		// Instantiate the real VS Code LogService with our custom logger.
		// The second argument is for additional loggers, which we don't need here.
		const ServiceInstance = new VscLogService(PrimaryLogger, []);

		// TODO: A full implementation would also need to listen for log level changes
		// from the host and update the logger's level accordingly.
		// Host.OnDidChangeLogLevel(level => ServiceInstance.setLevel(level));

		return ServiceInstance;
	}),
}) {}
