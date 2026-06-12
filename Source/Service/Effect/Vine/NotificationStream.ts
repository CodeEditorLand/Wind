/**
 * # Vine notification subscription
 *
 * Bridges Mountain's process-wide Vine notification broadcast to plain
 * frame callbacks consumable by every Wind/Sky subscriber concurrently.
 *
 * ## Architecture
 *
 * 1. Mountain runs the broadcast (`Vine::Client` -
 *    `tokio::sync::broadcast` capacity 4096, drop-oldest).
 * 2. The Tauri command `vine_subscribe_notifications` opens a
 *    `Channel<NotificationFramePayload>` that drains the broadcast
 *    receiver into the webview.
 * 3. This module multiplexes that single channel across an in-process
 *    subscriber array - one Tauri channel total, N callbacks.
 *
 * ## Usage
 *
 * ```typescript
 * import SubscribeVineNotifications, {
 *     SubscribeMethod,
 * } from "./NotificationStream.js";
 *
 * const Subscription = await SubscribeVineNotifications((Frame) => {
 *     console.debug(Frame.method);
 * });
 *
 * // later
 * Subscription.dispose();
 * ```
 *
 * Multiple subscribers compose freely - the Tauri channel is opened on
 * the first subscription and released when the last subscriber
 * disposes. Disposing the channel ends the Rust-side drain task: its
 * `channel.send(...)` fails once the webview callback is unregistered.
 *
 * Note on backpressure: delivery is synchronous fan-out per frame. The
 * producer (Mountain broadcast) is capacity-bounded with drop-oldest,
 * so a slow webview sees `Lagged(n)` gaps logged on the Rust side
 * rather than memory growth here.
 */

import type { Channel as TauriChannel } from "@tauri-apps/api/core";

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

export class VineSubscriptionError extends Error {
	readonly _tag = "VineSubscriptionError" as const;

	constructor(Message: string, Cause?: unknown) {
		super(Message, Cause === undefined ? undefined : { cause: Cause });

		this.name = "VineSubscriptionError";
	}
}

type FrameSubscriber = (Frame: NotificationFrame) => void;

const Subscribers: FrameSubscriber[] = [];

let ActiveChannel: TauriChannel<NotificationFrame> | null = null;

let PendingSetup: Promise<void> | null = null;

/**
 * Detach the webview-side channel callback. After this the Rust drain
 * task's next `channel.send` fails and the task exits.
 */
const ReleaseChannel = (
	Subscription: TauriChannel<NotificationFrame>,
): void => {
	Subscription.onmessage = () => {};

	try {
		(
			Subscription as unknown as { cleanupCallback?: () => void }
		).cleanupCallback?.();
	} catch {}
};

/**
 * Open the shared Tauri channel if it is not already open. If the
 * `vine_subscribe_notifications` invoke fails after the channel was
 * constructed, the partially-set-up channel is released before the
 * error propagates.
 */
const EnsureChannel = (): Promise<void> => {
	if (ActiveChannel !== null) {
		return Promise.resolve();
	}

	PendingSetup ??= (async () => {
		const Tauri = await import("@tauri-apps/api/core");

		const Subscription = new Tauri.Channel<NotificationFrame>();

		Subscription.onmessage = (Frame) => {
			for (const Deliver of [...Subscribers]) {
				try {
					Deliver(Frame);
				} catch {}
			}
		};

		try {
			await Tauri.invoke<number>("vine_subscribe_notifications", {
				channel: Subscription,
			});

			ActiveChannel = Subscription;
		} catch (Cause) {
			ReleaseChannel(Subscription);

			throw new VineSubscriptionError(
				`vine_subscribe_notifications failed: ${String(Cause)}`,

				Cause,
			);
		}
	})().finally(() => {
		PendingSetup = null;
	});

	return PendingSetup;
};

const SubscribeFrames = async (
	OnFrame: FrameSubscriber,
): Promise<{ readonly dispose: () => void }> => {
	Subscribers.push(OnFrame);

	try {
		await EnsureChannel();
	} catch (Cause) {
		const Index = Subscribers.indexOf(OnFrame);

		if (Index !== -1) {
			Subscribers.splice(Index, 1);
		}

		throw Cause;
	}

	let Disposed = false;

	return {
		dispose: (): void => {
			if (Disposed) {
				return;
			}

			Disposed = true;

			const Index = Subscribers.indexOf(OnFrame);

			if (Index !== -1) {
				Subscribers.splice(Index, 1);
			}

			if (Subscribers.length === 0 && ActiveChannel !== null) {
				const Subscription = ActiveChannel;

				ActiveChannel = null;

				ReleaseChannel(Subscription);
			}
		},
	};
};

/**
 * Convenience: deliver only frames whose method starts with `Prefix`.
 */
export const SubscribeMethodPrefix = (
	Prefix: string,

	OnFrame: FrameSubscriber,
): Promise<{ readonly dispose: () => void }> =>
	SubscribeFrames((Frame) => {
		if (Frame.method.startsWith(Prefix)) {
			OnFrame(Frame);
		}
	});

/**
 * Convenience: deliver only exact-match method names.
 */
export const SubscribeMethod = (
	Method: string,

	OnFrame: FrameSubscriber,
): Promise<{ readonly dispose: () => void }> =>
	SubscribeFrames((Frame) => {
		if (Frame.method === Method) {
			OnFrame(Frame);
		}
	});

/**
 * Diagnostic: ask Mountain for the current subscriber count. Useful
 * for verifying registrations don't leak across reloads.
 */
export const SubscriberCount = async (): Promise<number> => {
	const Tauri = await import("@tauri-apps/api/core");

	return Tauri.invoke<number>("vine_subscriber_count");
};

/**
 * Subscribe to every Vine notification frame. Resolves once the
 * shared Tauri channel is registered with Mountain; the returned
 * disposable removes the callback and, when it is the last one,
 * releases the channel.
 */
export default (
	OnFrame: FrameSubscriber,
): Promise<{ readonly dispose: () => void }> => SubscribeFrames(OnFrame);
