/**
 * @module CreateStream
 * @description
 * This module provides a factory function for creating a hybrid event emitter.
 * This "EventStream" bridges the gap between Effect's declarative `PubSub` for
 * modern consumers and VS Code's imperative `Event` API for legacy components,
 * ensuring both can subscribe to the same source of truth.
 */

import { Effect, PubSub } from "effect";

import { CreateEmitter, type Event } from "../../Platform/VSCode/Type.js";

/**
 * Defines the structure of a hybrid event stream, which provides both
 * an `Event` interface for legacy consumers and a `PubSub` for modern,
 * Effect-native consumers.
 */
export interface Interface<T> {
	/**
	 * An `Effect` that publishes a new event to all subscribers. It fires
	 * the data to both the internal `PubSub` and the `Emitter`.
	 * @param Data The event payload of type `T`.
	 * @returns A `void` `Effect`.
	 */
	readonly Fire: (Data: T) => Effect.Effect<void>;

	/**
	 * The underlying `PubSub` instance. Effect-native services can subscribe
	 * to this to receive events as a `Stream`.
	 */
	readonly PubSub: PubSub.PubSub<T>;

	/**
	 * The `vscode.Event` interface. Legacy VS Code components can subscribe
	 * to this event using the standard `event(listener)` pattern.
	 */
	readonly Event: Event<T>;

	/**
	 * An `Effect` that shuts down the event stream, disposing of the underlying
	 * `Emitter` and shutting down the `PubSub`.
	 */
	readonly Shutdown: () => Effect.Effect<void>;
}

/**
 * Creates a new `EventStream` managed within a `Scope`.
 *
 * This factory function returns a scoped `Effect` that, when executed,
 * will create a new `PubSub` and `Emitter`. It ensures that all resources
 * are gracefully released when the containing scope is closed.
 *
 * @returns An `Effect` that resolves to a new `EventStream<T>`.
 */
export const CreateStream = <T>(): Effect.Effect<Interface<T>> =>
	Effect.gen(function* (Generator) {
		const VSCodeEmitter = CreateEmitter<T>();
		const PubSubInstance = yield* Generator(PubSub.unbounded<T>());

		const Fire = (Data: T): Effect.Effect<void> =>
			Effect.all([
				PubSub.publish(PubSubInstance, Data),
				Effect.sync(() => VSCodeEmitter.fire(Data)),
			]).pipe(Effect.asVoid);

		const Shutdown = (): Effect.Effect<void> =>
			Effect.all([
				PubSub.shutdown(PubSubInstance),
				Effect.sync(() => VSCodeEmitter.dispose()),
			]).pipe(Effect.asVoid);

		// The finalizer ensures that if the scope containing the EventStream is
		// closed, the stream is automatically shut down to prevent resource leaks.
		yield* Generator(Effect.addFinalizer(() => Shutdown()));

		return {
			Fire,
			PubSub: PubSubInstance,
			Event: VSCodeEmitter.event,
			Shutdown,
		};
	}).pipe(Effect.scoped);
