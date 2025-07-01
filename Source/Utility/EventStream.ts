/**
 * @module EventStream (Utility)
 * @description A utility for creating a hybrid event emitter that bridges
 * the gap between Effect's declarative `PubSub` and VS Code's imperative
 * `Event` API.
 */

import { Effect, PubSub } from "effect";
import { Emitter, type Event } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/event.js";

/**
 * Defines the structure of a hybrid event stream, which provides both
 * an `Event` interface for legacy consumers and a `PubSub` for modern,
 * Effect-native consumers.
 */
export interface EventStream<T> {
	/**
	 * An `Effect` that publishes a new event to all subscribers. It fires
	 * the data to both the internal `PubSub` and the `Emitter`.
	 * @param Data The event payload of type `T`.
	 * @returns A `void` `Effect`.
	 */
	readonly Fire: (Data: T) => Effect.Effect<void, never>;

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
	readonly Shutdown: () => Effect.Effect<void, never>;
}

/**
 * A factory function that creates a new `EventStream`.
 *
 * This function returns an `Effect` that, when executed, will create a new
 * `PubSub` and `Emitter`. This ensures that the creation of these stateful
 * objects is managed within the Effect runtime.
 *
 * @returns An `Effect` that resolves to a new `EventStream<T>`.
 */
export const CreateEventStream = <T>(): Effect.Effect<EventStream<T>, never> =>
	Effect.gen(function* (Generator) {
		const VSCodeEmitter = new Emitter<T>();
		const PubSubInstance = yield* Generator(PubSub.unbounded<T>());

		const Fire = (Data: T): Effect.Effect<void> =>
			PubSub.publish(PubSubInstance, Data).pipe(
				Effect.andThen(Effect.sync(() => VSCodeEmitter.fire(Data))),
				Effect.asVoid,
			);

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
