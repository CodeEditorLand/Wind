/**
 * @module Service/DisposableLeakTracker
 * @description
 * Dev-only disposable leak tracker for Wind.
 *
 * Port of the lightweight `TRACK_DISPOSABLES` tracker in VS Code's
 * `vs/base/common/lifecycle.ts`: an allocation stack is captured when a
 * disposable is tracked, and a deferred check warns when that disposable
 * was never registered (disposed or parented) by the time the check runs.
 *
 * The build-time flag `__TRACK_DISPOSABLES__` is injected by
 * `Configuration/ESBuild/Config/TargetConfig.ts` and is `false` in
 * production. When it is off every exported function is a strict no-op:
 * no timer is scheduled, no stack is captured and nothing is logged.
 *
 * Defensive by design: a missing logger, a disabled flag, an unavailable
 * stack capture, an absent `WeakSet`/`setTimeout` and a repeated track or
 * report all degrade silently. Nothing on this path ever throws.
 */

declare const __TRACK_DISPOSABLES__: boolean | undefined;

/** Shape of the only logger the tracker ever needs. */
type WarnLogger = (Message: string) => void;

/** Seed used for the deferred warning delay, mirroring upstream's 3 s. */
const ReportDelay = 3000;

/** Module state. Allocated only after the flag is confirmed on. */
let Tracked: WeakSet<object> | null = null;

let Registered: WeakSet<object> | null = null;

let Logger: WarnLogger | null = null;

let Installed = false;

/**
 * True only when the dev-only flag was baked in as `true`.
 * `typeof` guards the case where the define was never applied (SSR, tsc).
 */
export const IsLeakTrackingEnabled = (): boolean => {

	try {

		return (
			typeof __TRACK_DISPOSABLES__ !== "undefined" &&
			__TRACK_DISPOSABLES__ === true
		);

	} catch {

		return false;

	}
};

/** Emit a warning through the installed logger, if any. Never throws. */
const Warn = (Message: string): void => {

	const Emit = Logger;

	if (typeof Emit !== "function") return;

	try {

		Emit(Message);

	} catch {}

};

/** Capture an allocation stack, or `null` if capture is unavailable. */
const CaptureStack = (): string | null => {

	try {

		const Stack = new Error("Potentially leaked disposable").stack;

		return typeof Stack === "string" && Stack.length > 0 ? Stack : null;

	} catch {

		return null;

	}
};

/**
 * Record the allocation of a disposable and defer a leak check.
 * Returns the same value unchanged (tracking is transparent).
 */
export const TrackDisposable = <T extends object>(Value: T): T => {

	if (!Installed || !IsLeakTrackingEnabled() || Value === null) return Value;

	try {

		if (typeof Value !== "object" && typeof Value !== "function") {
			return Value;
		}

		if (!Tracked || Tracked.has(Value)) return Value;

		const Stack = CaptureStack();

		if (Stack === null) return Value;

		if (typeof setTimeout !== "function") return Value;

		Tracked.add(Value);

		setTimeout(() => {

			try {

				if (Registered && Registered.has(Value)) return;

				const Name =
					(Value as { constructor?: { name?: string } }).constructor
						?.name ?? "Object";

				Warn(
					`[DisposableLeakTracker] Potentially leaked disposable (${Name}) allocated at:\n${Stack}`,
				);

			} catch {}

		}, ReportDelay);

	} catch {}

	return Value;

};

/**
 * Register a disposable as disposed or parented so its deferred check is
 * suppressed. Mirrors upstream `markAsDisposed` / `setParent`.
 */
export const RegisterDisposable = (Value: object): void => {

	if (!Installed || !IsLeakTrackingEnabled() || Value === null) return;

	try {

		if (typeof Value !== "object" && typeof Value !== "function") return;

		Registered?.add(Value);

	} catch {}

};

/**
 * Idempotently install the tracker. No-ops (returning `false`) when the
 * flag is off, so production never allocates state, timers or stacks.
 * A caller-supplied logger is used when present, otherwise `console.warn`
 * when available; a missing logger simply silences warnings.
 */
export const InstallDisposableLeakTracker = (
	LoggerOverride?: WarnLogger | null,
): boolean => {

	if (!IsLeakTrackingEnabled()) return false;

	if (Installed) return true;

	try {

		if (typeof LoggerOverride === "function") {

			Logger = LoggerOverride;

		} else if (
			typeof console !== "undefined" &&
			typeof console.warn === "function"
		) {

			Logger = (Message: string): void => console.warn(Message);

		} else {

			Logger = null;

		}

		if (typeof WeakSet !== "function") return false;

		Tracked = new WeakSet<object>();

		Registered = new WeakSet<object>();

		Installed = true;

		// Publish the local seam so vendored workbench code can feed
		// disposables in without a new lifecycle or a second install point.
		try {

			if (typeof window !== "undefined") {

				(window as any).__WindDisposableLeakTracker = {
					Track: TrackDisposable,
					Register: RegisterDisposable,
				};

			}

		} catch {}

		return true;

	} catch {

		return false;

	}
};
