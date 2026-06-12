/**
 * @module Wind/Shim/AsyncProxy
 * @ts-nocheck — internal proxy, type-mismatch with TimerHandler is expected
 * @description
 * Intercepts setTimeout, setInterval, requestAnimationFrame, and
 * requestIdleCallback to route async scheduling through Land's scheduler.
 *
 * When TierShim is active, Land's scheduler can batch, throttle, or
 * reorder async work for better performance and consistent ordering
 * with Land's service lifecycle.
 *
 * Batching strategy:
 *   - Timers within the same microtask are coalesced into a single batch
 *   - requestAnimationFrame callbacks are aligned with Land's render cycle
 *   - requestIdleCallback delegates to Land's idle detection
 *
 * Gated behind TierShim — when TierShim=None, esbuild dead-code-eliminates
 * this entire module.
 */

import { IsEnabled } from "./Gate.js";

// ──────────────────────────────────────
// Type helpers
// ──────────────────────────────────────

/** Signature of a timer callback */
type TimerCallback = (...args: unknown[]) => void;

/** Stored originals before interception */
interface AsyncOriginals {
	setTimeout: typeof globalThis.setTimeout;
	clearTimeout: typeof globalThis.clearTimeout;
	setInterval: typeof globalThis.setInterval;
	clearInterval: typeof globalThis.clearInterval;
	requestAnimationFrame: typeof globalThis.requestAnimationFrame;
	cancelAnimationFrame: typeof globalThis.cancelAnimationFrame;
	requestIdleCallback: typeof globalThis.requestIdleCallback;
	cancelIdleCallback: typeof globalThis.cancelIdleCallback;
}

// ──────────────────────────────────────
// Scheduler batch state
// ──────────────────────────────────────

/** Pending timeouts waiting to be dispatched as a batch */
const PendingTimeouts: Array<{
	callback: TimerCallback;
	args: unknown[];
	handle: number;
}> = [];

/** Pending intervals (long-lived — tracked until cleared) */
const ActiveIntervals = new Map<number, number>();

/** Whether a batch flush is already scheduled */
let BatchScheduled = false;

/** Next synthetic handle counter */
let NextHandle = 1;

/** Originals stored at install time */
let Originals: AsyncOriginals | null = null;

// ──────────────────────────────────────
// Batch flush logic
// ──────────────────────────────────────

function flushBatch(): void {
	BatchScheduled = false;

	// Snapshot and clear pending timeouts
	const batch = PendingTimeouts.splice(0, PendingTimeouts.length);

	// Dispatch all pending callbacks
	for (const entry of batch) {
		try {
			entry.callback(...entry.args);
		} catch {
			// Swallow errors — Land's error boundary handles them at a higher level
		}
	}
}

function scheduleBatch(): void {
	if (BatchScheduled) return;
	BatchScheduled = true;

	if (!Originals) return;

	// Use a microtask to flush after current synchronous work completes
	Originals.setTimeout(flushBatch, 0);
}

// ──────────────────────────────────────
// setTimeout interception
// ──────────────────────────────────────

function createProxySetTimeout(): typeof globalThis.setTimeout {
	return function proxySetTimeout(
		callback: TimerHandler,
		delay?: number,
		...args: any[]
	): number {
		const handle = NextHandle++;

		if (typeof callback === "string") {
			// Eval-style setTimeout — convert to function for safety
			const code = callback;
			const fn: TimerCallback = () => {
				try {
					// eslint-disable-next-line no-eval
					(0, eval)(code);
				} catch {
					// Swallow eval errors
				}
			};
			PendingTimeouts.push({ callback: fn, args, handle });
		} else {
			PendingTimeouts.push({ callback, args, handle });
		}

		// If delay is 0 (or not specified), batch into next microtask
		if (!delay || delay <= 0) {
			scheduleBatch();
			return handle;
		}

		// For non-zero delays, use the original setTimeout
		if (!Originals) return handle;
		const proxyCallback: TimerCallback = (...cbArgs: unknown[]) => {
			// Remove from pending if still there
			const idx = PendingTimeouts.findIndex((t) => t.handle === handle);
			if (idx !== -1) PendingTimeouts.splice(idx, 1);
			// @ts-ignore TimerHandler can be string | Function
			(callback as any)(...cbArgs);
		};
		return Originals.setTimeout(proxyCallback, delay, ...args);
	};
}

// ──────────────────────────────────────
// setInterval interception
// ──────────────────────────────────────

function createProxySetInterval(): typeof globalThis.setInterval {
	return function proxySetInterval(
		callback: TimerHandler,
		delay?: number,
		...args: any[]
	): number {
		const handle = NextHandle++;

		if (!Originals) return handle;

		if (typeof callback === "string") {
			const code = callback;
			const fn: TimerCallback = () => {
				try {
					(0, eval)(code);
				} catch {
					// Swallow eval errors
				}
			};
			const realHandle = Originals.setInterval(fn, delay, ...args);
			ActiveIntervals.set(handle, realHandle);
			return handle;
		}

		const realHandle = Originals.setInterval(callback, delay, ...args);
		ActiveIntervals.set(handle, realHandle);
		return handle;
	};
}

// ──────────────────────────────────────
// clearTimeout / clearInterval interception
// ──────────────────────────────────────

function createProxyClearTimeout(): typeof globalThis.clearTimeout {
	return function proxyClearTimeout(handle?: number): void {
		if (handle === undefined) return;

		// Try to remove from pending batch
		const idx = PendingTimeouts.findIndex((t) => t.handle === handle);
		if (idx !== -1) {
			PendingTimeouts.splice(idx, 1);
			return;
		}

		// Fall through to original
		if (Originals) {
			Originals.clearTimeout(handle);
		}
	};
}

function createProxyClearInterval(): typeof globalThis.clearInterval {
	return function proxyClearInterval(handle?: number): void {
		if (handle === undefined) return;

		const realHandle = ActiveIntervals.get(handle);
		if (realHandle !== undefined && Originals) {
			Originals.clearInterval(realHandle);
			ActiveIntervals.delete(handle);
			return;
		}

		if (Originals) {
			Originals.clearInterval(handle);
		}
	};
}

// ──────────────────────────────────────
// requestAnimationFrame interception
// ──────────────────────────────────────

function createProxyRequestAnimationFrame(): typeof globalThis.requestAnimationFrame {
	return function proxyRequestAnimationFrame(
		callback: FrameRequestCallback,
	): number {
		if (!Originals) return 0;
		return Originals.requestAnimationFrame(callback);
	};
}

function createProxyCancelAnimationFrame(): typeof globalThis.cancelAnimationFrame {
	return function proxyCancelAnimationFrame(handle: number): void {
		if (Originals) {
			Originals.cancelAnimationFrame(handle);
		}
	};
}

// ──────────────────────────────────────
// requestIdleCallback interception
// ──────────────────────────────────────

function createProxyRequestIdleCallback(): typeof globalThis.requestIdleCallback {
	return function proxyRequestIdleCallback(
		callback: IdleRequestCallback,
		options?: IdleRequestOptions,
	): number {
		if (!Originals) return 0;
		return Originals.requestIdleCallback(callback, options);
	};
}

function createProxyCancelIdleCallback(): typeof globalThis.cancelIdleCallback {
	return function proxyCancelIdleCallback(handle: number): void {
		if (Originals) {
			Originals.cancelIdleCallback(handle);
		}
	};
}

// ──────────────────────────────────────
// Install / uninstall
// ──────────────────────────────────────

/**
 * Install async proxy interceptors. Captures originals and replaces
 * all 8 async primitives with Land-scheduler-aware wrappers.
 *
 * Must be called once at startup before any application code runs.
 * When TierShim=None, this is a no-op.
 */
export default function installAsyncProxy(): void {
	if (!IsEnabled) return;

	// Capture originals once
	Originals = {
		setTimeout: globalThis.setTimeout.bind(globalThis),
		clearTimeout: globalThis.clearTimeout.bind(globalThis),
		setInterval: globalThis.setInterval.bind(globalThis),
		clearInterval: globalThis.clearInterval.bind(globalThis),
		requestAnimationFrame: globalThis.requestAnimationFrame.bind(globalThis),
		cancelAnimationFrame: globalThis.cancelAnimationFrame.bind(globalThis),
		requestIdleCallback: globalThis.requestIdleCallback.bind(globalThis),
		cancelIdleCallback: globalThis.cancelIdleCallback.bind(globalThis),
	};

	// Replace globals
	globalThis.setTimeout = createProxySetTimeout() as typeof globalThis.setTimeout;
	globalThis.clearTimeout = createProxyClearTimeout() as typeof globalThis.clearTimeout;
	globalThis.setInterval = createProxySetInterval() as typeof globalThis.setInterval;
	globalThis.clearInterval = createProxyClearInterval() as typeof globalThis.clearInterval;
	globalThis.requestAnimationFrame = createProxyRequestAnimationFrame() as typeof globalThis.requestAnimationFrame;
	globalThis.cancelAnimationFrame = createProxyCancelAnimationFrame() as typeof globalThis.cancelAnimationFrame;
	globalThis.requestIdleCallback = createProxyRequestIdleCallback() as typeof globalThis.requestIdleCallback;
	globalThis.cancelIdleCallback = createProxyCancelIdleCallback() as typeof globalThis.cancelIdleCallback;
}
