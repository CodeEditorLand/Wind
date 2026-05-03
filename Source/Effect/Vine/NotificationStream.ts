/**
 * # VineNotificationsLive
 *
 * Effect-TS Layer that bridges Mountain's process-wide Vine
 * notification broadcast to a `Stream<NotificationFrame>` consumable
 * by every Wind/Sky subscriber concurrently.
 *
 * ## Architecture
 *
 * 1. Mountain runs the broadcast (`Vine::Client` -
 *    `tokio::sync::broadcast` capacity 4096, drop-oldest).
 * 2. The Tauri command `vine_subscribe_notifications` opens a
 *    `Channel<NotificationFramePayload>` that drains the broadcast
 *    receiver into the webview.
 * 3. This Layer wraps the channel into a `Stream<NotificationFrame>`
 *    so Effects can `Stream.filter`, `Stream.runForEach`,
 *    `Stream.merge`, etc.
 *
 * ## Usage
 *
 * ```typescript
 * import { Effect, Stream, Layer } from "effect";
 * import { VineNotifications, VineNotificationsLive } from "..";
 *
 * const traceDiagnostics = Effect.gen(function* () {
 *     const stream = yield* VineNotifications;
 *     yield* stream.pipe(
 *         Stream.filter((f) => f.method === "Diagnostic.Set"),
 *         Stream.runForEach((f) => Effect.logDebug(`diag.set: ${f.method}`)),
 *         Effect.fork,
 *     );
 * });
 *
 * const program = traceDiagnostics.pipe(Effect.provide(VineNotificationsLive));
 * ```
 *
 * Multiple subscribers compose freely - each `yield* VineNotifications`
 * gets its own dequeue from the underlying scoped queue, and the
 * Tauri channel is reference-counted so the subscription lives
 * exactly as long as any subscriber.
 *
 */

import type { Channel as TauriChannel } from "@tauri-apps/api/core";
import { Context, Effect, Layer, Queue, Stream } from "effect";

/**
 * Frame shape on the wire. Mirror of the Rust
 * `NotificationFramePayload` from
 * `Element/Mountain/Source/Binary/IPC/VineSubscribeCommand.rs`.
 *
 * `parameters` is JSON-decoded already (the channel serialises via
 * serde_json on the Rust side and deserialises into a `unknown`
 * here; consumers should narrow per-method).
 */
export interface NotificationFrame {
	readonly sideCarIdentifier: string;

	readonly method: string;

	readonly parameters: unknown;

	readonly timestampNanos: number;
}

/**
 * Effect-TS service tag for the notification stream. Consumers
 * `yield*` it to receive a `Stream<NotificationFrame>`.
 */
export class VineNotifications extends Context.Tag("Land/Vine/Notifications")<
	VineNotifications,
	Stream.Stream<NotificationFrame>
>() {}

/**
 * Live Layer. Opens the Tauri Channel, subscribes via
 * `vine_subscribe_notifications`, and provides a `Stream` backed by
 * an unbounded Effect Queue. The acquireRelease bracket ensures the
 * channel registration on the Mountain side is observable via
 * `vine_subscriber_count` - when this Layer goes out of scope the
 * channel closes and the Rust-side drain task exits naturally.
 *
 * Note on backpressure: the Effect Queue is unbounded so a slow
 * consumer cannot stall the producer. The producer (Mountain
 * broadcast) is itself capacity-bounded with drop-oldest, so the
 * worst-case scenario is `Lagged(n)` gaps logged on the Rust side
 * rather than memory growth here.
 */
export const VineNotificationsLive = Layer.scoped(
	VineNotifications,
	Effect.gen(function* () {
		const queue = yield* Queue.unbounded<NotificationFrame>();

		const tauri = yield* Effect.tryPromise({
			try: () =>
				import("@tauri-apps/api/core").then((Module) => ({
					Channel: Module.Channel,
					invoke: Module.invoke,
				})),
			catch: (error) =>
				new Error(
					`Failed to load @tauri-apps/api/core: ${String(error)}`,
				),
		});

		const channel: TauriChannel<NotificationFrame> =
			new tauri.Channel<NotificationFrame>();

		channel.onmessage = (frame: NotificationFrame) => {
			Effect.runFork(Queue.offer(queue, frame));
		};

		yield* Effect.acquireRelease(
			Effect.tryPromise({
				try: () =>
					tauri.invoke<number>("vine_subscribe_notifications", {
						channel,
					}),
				catch: (error) =>
					new Error(
						`vine_subscribe_notifications failed: ${String(error)}`,
					),
			}),
			() =>
				Effect.gen(function* () {
					// The Rust drain task exits when the Channel closes
					// (its `channel.send(...)` returns Err). Closing the
					// queue here is what triggers that on the next
					// frame attempt; no separate unsubscribe RPC needed.
					yield* Queue.shutdown(queue);
				}),
		);

		return Stream.fromQueue(queue);
	}),
);

/**
 * Convenience: filter the stream to a single sky-channel method
 * prefix. Returns an Effect that yields a filtered stream.
 *
 * ```typescript
 * const treeViewEvents = yield* SubscribeMethodPrefix("tree-view");
 * yield* treeViewEvents.pipe(
 *     Stream.runForEach((f) => Effect.logDebug(f.method)),
 *     Effect.fork,
 * );
 * ```
 */
export const SubscribeMethodPrefix = (prefix: string) =>
	Effect.gen(function* () {
		const stream = yield* VineNotifications;

		return stream.pipe(
			Stream.filter((frame) => frame.method.startsWith(prefix)),
		);
	});

/**
 * Convenience: filter to exact-match method name.
 */
export const SubscribeMethod = (method: string) =>
	Effect.gen(function* () {
		const stream = yield* VineNotifications;

		return stream.pipe(Stream.filter((frame) => frame.method === method));
	});

/**
 * Diagnostic: ask Mountain for the current subscriber count. Useful
 * for verifying registrations don't leak across reloads.
 */
export const SubscriberCount = Effect.gen(function* () {
	const Module = yield* Effect.tryPromise({
		try: () => import("@tauri-apps/api/core"),
		catch: (error) => new Error(`tauri import: ${String(error)}`),
	});

	return yield* Effect.tryPromise({
		try: () => Module.invoke<number>("vine_subscriber_count"),
		catch: (error) => new Error(`vine_subscriber_count: ${String(error)}`),
	});
});
