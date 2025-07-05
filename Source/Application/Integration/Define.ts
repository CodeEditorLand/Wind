/**
 * @module Define
 * @description
 * This module defines the contract and the canonical implementation for the
 * `IntegrationService`. This service is the lowest-level bridge to the native
 * Tauri host, providing a declarative, Effect-native API for all interactions
 * with the backend.
 *
 * The implementation is provided directly within the service definition, a pattern
 * that encapsulates the default behavior of the service.
 */

import { invoke as TauriInvoke, type InvokeArgs } from "@tauri-apps/api/core";
import {
	emit as TauriEmit,
	listen as TauriListen,
	type Event as TauriEvent,
	type UnlistenFn,
} from "@tauri-apps/api/event";
import { Effect } from "effect";

import { IntegrationProblem } from "./Problem.js";

/**
 * The contract for the `IntegrationService`, defining all methods that bridge
 * the application to the native host.
 */
export interface Interface {
	/**
	 * Invokes a command on the native host and returns its response.
	 *
	 * This is an Effect-native wrapper around Tauri's `invoke` function.
	 * It is the primary method for request-response style communication.
	 *
	 * @param Command The name of the command to invoke on the host.
	 * @param Arguments The optional arguments to pass to the command.
	 * @returns An `Effect` that resolves with the command's response of type `T`,
	 * or fails with an `IntegrationProblem`.
	 */
	readonly Invoke: <T>(
		Command: string,
		Arguments?: InvokeArgs,
	) => Effect.Effect<T, IntegrationProblem>;

	/**
	 * Listens for a specific event from the native host.
	 *
	 * This is an Effect-native wrapper around Tauri's `listen` function.
	 * It is used for receiving asynchronous, event-driven messages from the host.
	 * The `Effect` resolves with an `UnlistenFn` that, when called, will
	 * unregister the event listener. This `Effect` should be managed within a
	 * `Scope` to ensure proper resource cleanup.
	 *
	 * @param EventName The name of the event to listen for.
	 * @param Handler A callback function to execute when the event is received.
	 * @returns An `Effect` that resolves with an `UnlistenFn` for cleanup,
	 * or fails with an `IntegrationProblem` if the listener cannot be attached.
	 */
	readonly Listen: <T>(
		EventName: string,
		Handler: (Event: TauriEvent<T>) => void,
	) => Effect.Effect<UnlistenFn, IntegrationProblem>;

	/**
	 * Emits an event to the native host.
	 *
	 * This is an Effect-native wrapper around Tauri's `emit` function.
	 * It is used for fire-and-forget style communication from the application
	 * to the host.
	 *
	 * @param EventName The name of the event to emit.
	 * @param Payload The optional payload to send with the event.
	 * @returns An `Effect` that completes when the event has been sent,
	 * or fails with an `IntegrationProblem`.
	 */
	readonly Emit: (
		EventName: string,
		Payload?: unknown,
	) => Effect.Effect<void, IntegrationProblem>;
}

/**
 * The `Effect.Service` for the `IntegrationService`. It provides the definitive
 * implementation that directly wraps the Tauri APIs, ensuring all native
 * interactions are performed within the Effect runtime and have standardized
 * error handling.
 */
export class IntegrationService extends Effect.Service<Interface>()(
	"Service/Integration",
	{
		effect: Effect.succeed({
			Invoke: <T>(Command: string, Arguments?: InvokeArgs) =>
				Effect.tryPromise({
					try: () => TauriInvoke<T>(Command, Arguments),
					catch: (Cause) =>
						new IntegrationProblem({ Cause, Context: "Invoke" }),
				}),

			Listen: <T>(
				EventName: string,
				Handler: (Event: TauriEvent<T>) => void,
			) =>
				Effect.tryPromise({
					try: () => TauriListen<T>(EventName, Handler),
					catch: (Cause) =>
						new IntegrationProblem({ Cause, Context: "Listen" }),
				}),

			Emit: (EventName: string, Payload?: unknown) =>
				Effect.tryPromise({
					try: () => TauriEmit(EventName, Payload),
					catch: (Cause) =>
						new IntegrationProblem({ Cause, Context: "Emit" }),
				}),
		}),
	},
) {}
