/*
 * File: Wind/Source/Application/Extensions/Host/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: ./Error/HostProblem.js, effect, vs/platform/extensions/common/extensionHostStarter.js, vs/platform/utilityProcess/electron-main/utilityProcess.js
 */

// Source/Application/Extensions/Host/Live.ts
import { Duration, Effect, Fiber, Layer, Queue, Scope, Stream } from "effect";
import type { IExtensionHostProcessOptions } from "vs/platform/extensions/common/extensionHostStarter.js";
import { WindowUtilityProcess } from "vs/platform/utilityProcess/electron-main/utilityProcess.js";

import {
	LifecycleMainServiceTag,
	LogServiceTag,
	TelemetryServiceTag,
	WindowsMainServiceTag,
} from "../../../Platform/VSCode/Provide.js";
import { HostShutdownProblem, HostStartProblem } from "./Error/HostProblem.js";
import ExtensionHostStarterTag, {
	type Interface as ExtensionHostStarter,
	type RunningHost,
} from "./Tag.js";

let nextId = 0;

const LiveExtensionHostStarter = Layer.succeed(ExtensionHostStarterTag, {
	_serviceBrand: undefined,

	start: (
		options: IExtensionHostProcessOptions,
	): Effect.Effect<RunningHost, HostStartProblem, Scope.Scope> =>
		Effect.gen(function* (_) {
			const id = String(++nextId);

			// Dependencies are resolved from the context.
			const LogService = yield* _(LogServiceTag);
			const WindowsMainService = yield* _(WindowsMainServiceTag);
			const TelemetryService = yield* _(TelemetryServiceTag);
			const LifecycleMainService = yield* _(LifecycleMainServiceTag);

			// Create the utility process wrapper.
			const extHostProcess = new WindowUtilityProcess(
				LogService,
				WindowsMainService,
				TelemetryService,
				LifecycleMainService,
			);

			// The core resource management. `acquireRelease` handles everything.
			return yield* _(
				Effect.acquireRelease(
					// --- Acquire Effect ---
					Effect.gen(function* (_) {
						LogService.info(
							`[PID ${process.pid}] [${id}] starting extension host...`,
						);

						// Start the process
						extHostProcess.start({
							...options,
							type: "extensionHost",
							correlationId: id,
							// ... other args from original file
						});

						// Wait for the process to spawn
						const pid = yield* _(
							Effect.fromEvent(extHostProcess, "onSpawn"),
						);

						// Create streams from the process events.
						// This turns the event-driven communication into a composable data pipeline.
						const stdout$ = Stream.fromEvent<string>(
							extHostProcess,
							"onStdout",
						);
						const stderr$ = Stream.fromEvent<string>(
							extHostProcess,
							"onStderr",
						);
						const messages$ = Stream.fromEvent<any>(
							extHostProcess,
							"onMessage",
						);
						const onExit = Effect.fromEvent<{
							code: number;
							signal: string;
						}>(extHostProcess, "onExit");

						LogService.info(
							`[PID ${process.pid}] [${id}] started extension host with pid ${pid}`,
						);

						// Return the live `RunningHost` object.
						return {
							id,
							pid,
							stdout: stdout$,
							stderr: stderr$,
							messages: messages$,
							onExit,
							enableInspectPort: () =>
								Effect.tryPromise(() =>
									extHostProcess.enableInspectPort(),
								),
						} satisfies RunningHost;
					}).pipe(
						Effect.mapError(
							(cause) => new HostStartProblem({ cause, options }),
						),
					),

					// --- Release Effect ---
					(host, exit) =>
						Effect.gen(function* (_) {
							LogService.info(
								`[PID ${process.pid}] [${host.id}] shutting down extension host with pid ${host.pid}... (Exit: ${exit._tag})`,
							);

							// The process is killed automatically. Then we wait for it to exit.
							extHostProcess.kill();

							// The original implementation had a timeout to forcefully kill a stuck process.
							// We can model this declaratively with `Effect.timeout`.
							const waitForExit = Effect.fromEvent<{
								code: number;
								signal: string;
							}>(extHostProcess, "onExit");

							const result = yield* _(
								Effect.timeout(
									waitForExit,
									Duration.seconds(1),
								),
							);
							if (Option.isNone(result)) {
								LogService.error(
									`[PID ${process.pid}] [${host.id}] extension host did not exit within 1s, forcefully killing...`,
								);
								try {
									process.kill(host.pid);
								} catch {
									/* ignore */
								}
								yield* _(
									Effect.fail(
										new HostShutdownProblem({
											cause: "Timeout",
											context: "GracefulShutdownTimeout",
										}),
									),
								);
							}

							LogService.info(
								`[PID ${process.pid}] [${host.id}] extension host with pid ${host.pid} successfully shut down.`,
							);
							extHostProcess.dispose();
						}),
				),
			);
		}),
});

export default LiveExtensionHostStarter;
