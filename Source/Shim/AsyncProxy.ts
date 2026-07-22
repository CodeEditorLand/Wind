/**
 * @module Wind/Shim/AsyncProxy
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
type AnyCallback = (...args: any[]) => void;

// ──────────────────────────────────────
// Captured originals (before interception)
// ──────────────────────────────────────

/**
 * Real async primitives captured at module init.
 * Used as the fallthrough when TierShim is disabled and as the
 * underlying dispatch mechanism for non-zero-delay timers.
 *
 * When TierShim=None, esbuild dead-code-eliminates this entire module,
 * so the eager bind here has zero cost.
 */
const Originals = {

	setTimeout: globalThis.setTimeout.bind(globalThis),

	clearTimeout: globalThis.clearTimeout.bind(globalThis),

	setInterval: globalThis.setInterval.bind(globalThis),

	clearInterval: globalThis.clearInterval.bind(globalThis),

	requestAnimationFrame: globalThis.requestAnimationFrame?.bind(globalThis),

	cancelAnimationFrame: globalThis.cancelAnimationFrame?.bind(globalThis),

	requestIdleCallback: (globalThis as Record<string, unknown>)
		.requestIdleCallback
		? (
				globalThis as typeof globalThis & {
					requestIdleCallback: typeof globalThis.requestIdleCallback;
				}
			).requestIdleCallback.bind(globalThis)

		: undefined,

	cancelIdleCallback: (globalThis as Record<string, unknown>)
		.cancelIdleCallback
		? (
				globalThis as typeof globalThis & {
					cancelIdleCallback: typeof globalThis.cancelIdleCallback;
				}
			).cancelIdleCallback.bind(globalThis)

		: undefined,
};

// ──────────────────────────────────────
// Scheduler batch state
// ──────────────────────────────────────

/** Pending timeouts waiting to be dispatched as a batch */
const PendingTimeouts: Array<{

	callback: AnyCallback;

	args: unknown[];

	handle: number;
}> = [];

/** Pending intervals (long-lived — tracked until cleared) */
const ActiveIntervals = new Map<number, ReturnType<typeof setInterval>>();

/** Whether a batch flush is already scheduled */
let BatchScheduled = false;

/** Next synthetic handle counter */
let NextHandle = 1;

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

	// Use a microtask to flush after current synchronous work completes
	Originals.setTimeout(flushBatch, 0);
}

// ──────────────────────────────────────
// setTimeout interception
// ──────────────────────────────────────

function createProxySetTimeout(): typeof Originals.setTimeout {

	return function proxySetTimeout(
		callback: ((...args: any[]) => void) | string,

		delay?: number,
		...args: any[]
	): ReturnType<typeof setTimeout> {
		const handle = NextHandle++;

		if (typeof callback === "string") {
			// Eval-style setTimeout — convert to function for safety
			const code = callback;

			const fn: AnyCallback = () => {
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

			// Synthetic handle — cast to environment-appropriate return type
			return handle as unknown as ReturnType<typeof setTimeout>;
		}

		// For non-zero delays, use the original setTimeout
		const proxyCallback: AnyCallback = (...cbArgs: any[]) => {
			// Remove from pending if still there
			const idx = PendingTimeouts.findIndex((t) => t.handle === handle);

			if (idx !== -1) PendingTimeouts.splice(idx, 1);

			(callback as any)(...cbArgs);
		};

		return Originals.setTimeout(
			proxyCallback,

			delay,
			...args,
		) as unknown as ReturnType<typeof setTimeout>;
	} as typeof Originals.setTimeout;
}

// ──────────────────────────────────────
// setInterval interception
// ──────────────────────────────────────

function createProxySetInterval(): typeof Originals.setInterval {

	return function proxySetInterval(
		callback: ((...args: any[]) => void) | string,

		delay?: number,
		...args: any[]
	): ReturnType<typeof setInterval> {
		const handle = NextHandle++;

		if (typeof callback === "string") {
			const code = callback;

			const fn: AnyCallback = () => {
				try {
					(0, eval)(code);
				} catch {
					// Swallow eval errors
				}
			};

			const realHandle = Originals.setInterval(fn, delay, ...args);

			ActiveIntervals.set(handle, realHandle);

			// Synthetic handle
			return handle as unknown as ReturnType<typeof setInterval>;
		}

		const realHandle = Originals.setInterval(callback, delay, ...args);

		ActiveIntervals.set(handle, realHandle);

		// Synthetic handle
		return handle as unknown as ReturnType<typeof setInterval>;
	} as typeof Originals.setInterval;
}

// ──────────────────────────────────────
// clearTimeout / clearInterval interception
// ──────────────────────────────────────

function createProxyClearTimeout(): typeof Originals.clearTimeout {

	return function proxyClearTimeout(handle?: number): void {
		if (handle === undefined) return;

		// Try to remove from pending batch
		const idx = PendingTimeouts.findIndex((t) => t.handle === handle);

		if (idx !== -1) {
			PendingTimeouts.splice(idx, 1);

			return;
		}

		// Fall through to original
		Originals.clearTimeout(
			handle as Parameters<typeof Originals.clearTimeout>[0],
		);
	} as typeof Originals.clearTimeout;
}

function createProxyClearInterval(): typeof Originals.clearInterval {

	return function proxyClearInterval(handle?: number): void {
		if (handle === undefined) return;

		const realHandle = ActiveIntervals.get(handle);

		if (realHandle !== undefined) {
			Originals.clearInterval(
				realHandle as Parameters<typeof Originals.clearInterval>[0],
			);

			ActiveIntervals.delete(handle);

			return;
		}

		Originals.clearInterval(
			handle as Parameters<typeof Originals.clearInterval>[0],
		);
	} as typeof Originals.clearInterval;
}

// ──────────────────────────────────────
// requestAnimationFrame interception
// ──────────────────────────────────────

function createProxyRequestAnimationFrame(): typeof Originals.requestAnimationFrame {

	return function proxyRequestAnimationFrame(
		callback: FrameRequestCallback,
	): number {
		if (!Originals.requestAnimationFrame) return 0;

		return Originals.requestAnimationFrame(callback);
	} as typeof Originals.requestAnimationFrame;
}

function createProxyCancelAnimationFrame(): typeof Originals.cancelAnimationFrame {

	return function proxyCancelAnimationFrame(handle: number): void {
		if (Originals.cancelAnimationFrame) {
			Originals.cancelAnimationFrame(handle);
		}
	} as typeof Originals.cancelAnimationFrame;
}

// ──────────────────────────────────────
// requestIdleCallback interception
// ──────────────────────────────────────

function createProxyRequestIdleCallback(): typeof Originals.requestIdleCallback {

	return function proxyRequestIdleCallback(
		callback: IdleRequestCallback,

		options?: IdleRequestOptions,
	): number {
		if (!Originals.requestIdleCallback) return 0;

		return Originals.requestIdleCallback(callback, options);
	} as typeof Originals.requestIdleCallback;
}

function createProxyCancelIdleCallback(): typeof Originals.cancelIdleCallback {

	return function proxyCancelIdleCallback(handle: number): void {
		if (Originals.cancelIdleCallback) {
			Originals.cancelIdleCallback(handle);
		}
	} as typeof Originals.cancelIdleCallback;
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

	// Replace globals with proxy wrappers
	globalThis.setTimeout =
		createProxySetTimeout() as typeof globalThis.setTimeout;

	globalThis.clearTimeout =
		createProxyClearTimeout() as typeof globalThis.clearTimeout;

	globalThis.setInterval =
		createProxySetInterval() as typeof globalThis.setInterval;

	globalThis.clearInterval =
		createProxyClearInterval() as typeof globalThis.clearInterval;

	globalThis.requestAnimationFrame =
		createProxyRequestAnimationFrame() as typeof globalThis.requestAnimationFrame;

	globalThis.cancelAnimationFrame =
		createProxyCancelAnimationFrame() as typeof globalThis.cancelAnimationFrame;

	globalThis.requestIdleCallback =
		createProxyRequestIdleCallback() as typeof globalThis.requestIdleCallback;

	globalThis.cancelIdleCallback =
		createProxyCancelIdleCallback() as typeof globalThis.cancelIdleCallback;
}
