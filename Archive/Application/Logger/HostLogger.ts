/**
 * @module HostLogger
 * @description
 * This module defines a custom `ILogger` implementation that forwards all
 * log messages to the native host (`Mountain`) via the `HostService`. This allows
 * for centralized log management in the native backend.
 */

import {
	AbstractMessageLogger,
	type ILogger,
	type LogLevel,
} from "@codeeditorland/output/vs/platform/log/common/log.js";
import { Effect } from "effect";

import type { Interface as Host } from "../Host/Define.js";

/**
 * An `ILogger` implementation that sends log messages to the host process.
 * It formats messages according to VS Code's standards and uses the
 * `HostService` to transmit them to the native backend.
 */
export class HostLogger extends AbstractMessageLogger implements ILogger {
	/**
	 * Creates an instance of the HostLogger.
	 * @param Host The `HostService` instance used to forward log messages.
	 * @param LogLevel The initial log level for the logger.
	 */
	constructor(
		private readonly Host: Host,
		LogLevel: LogLevel,
	) {
		super();
		this.setLevel(LogLevel);
	}

	/**
	 * The core logging method. It creates and runs an `Effect` that sends
	 * the log message to the host.
	 * @param Level The `LogLevel` of the message.
	 * @param Message The formatted message string to log.
	 */
	protected log(Level: LogLevel, Message: string): void {
		const LogEffect = this.Host.Log(Level, Message).pipe(
			Effect.catchAll((Error) =>
				// If logging to the host fails, we fall back to the console to ensure
				// the message is not lost, and we log the forwarding error itself.
				Effect.sync(() => {
					console.error(
						"[HostLogger] Failed to forward log to host:",
						Error,
					);
					console.log(
						`[HostLogger] Original Message: [${Level}] ${Message}`,
					);
				}),
			),
		);

		// Logging should not block the application. We fork the effect to run in
		// the background.
		Effect.runFork(LogEffect);
	}

	/**
	 * Flushes the logger. In this architecture, flushing is a host-side concern,
	 * so this method is a no-op on the client.
	 */
	public override flush(): void {
		// Implementation is not needed as flushing is managed by the host.
	}
}
