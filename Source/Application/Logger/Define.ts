/**
 * @module Define
 * @description
 * This module defines the service interface and live implementation for the
 * `ILogService`, which provides logging capabilities to the application.
 */

import {
	LogLevel,
	LoggerService as VSCodeLoggerService,
	type ILogService as VSCodeLogService,
} from "@codeeditorland/output/vs/platform/log/common/log.js";
import { Effect } from "effect";

import { HostService } from "../Host/Define.js";
import { HostLogger } from "./HostLogger.js";

/**
 * The `Effect.Service` for the `ILogService`.
 *
 * This service implementation "lifts" the original `LoggerService` class from
 * VS Code. It instantiates it with a custom `HostLogger`, which acts as the
 * primary logger. The `HostLogger` forwards all log messages to the native
 * `Mountain` host via the `HostService`. This ensures that all workbench logs
 * are centrally managed by the native backend.
 *
 * The service is registered with the identifier "loggerService" for compatibility
 * with legacy VS Code service lookups.
 */
export class LoggerService extends Effect.Service<VSCodeLogService>()(
	"loggerService",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);

			// The initial log level is sourced from the configuration provided by the host at startup.
			const InitialLogLevel =
				(Host.Configuration as any).logLevel ?? LogLevel.Info;
			const PrimaryLogger = new HostLogger(Host, InitialLogLevel);

			// Instantiate the real VS Code LoggerService with our custom logger.
			const ServiceInstance = new VSCodeLoggerService(PrimaryLogger);

			return ServiceInstance;
		}),
	},
) {}
