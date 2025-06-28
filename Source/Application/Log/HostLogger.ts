/**
 * @module HostLogger (Application/Log)
 * @description Defines a custom `ILogger` implementation that forwards all
 * log messages to the native host via the `HostService`.
 */

import { Effect } from "effect";
import {
	AbstractMessageLogger,
	type ILogger,
	LogLevel,
} from "vs/platform/log/common/log.js";
import { HostService } from "Source/Application/Host/Service.js";

/**
 * An `ILogger` implementation that sends log messages to the host process.
 * It formats messages and uses the `HostService` to transmit them.
 */
export class HostLogger extends AbstractMessageLogger implements ILogger {
	constructor(
		private readonly Host: HostService,
		LogLevel: LogLevel,
	) {
		super();
		this.setLevel(LogLevel);
	}

	protected log(level: LogLevel, message: string): void {
		const LogEffect = this.Host.Log(level, message).pipe(
			Effect.catchAll((Error) =>
				// If logging to host fails, fallback to console to not lose the message.
				Effect.sync(() =>
					console.error("[HostLogger] Failed to forward log to host:", Error),
				),
			),
		);

		// Logging is a fire-and-forget operation from the UI's perspective.
		Effect.runFork(LogEffect);
	}

	flush(): void {
		// Flush is a host-side concept in this architecture.
	}
}
