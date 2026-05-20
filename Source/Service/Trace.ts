/**
 * @module Service/Trace
 *
 * Lightweight tracing utilities used by TauriMainProcessService.
 * Zero console.* output - uses `performance.mark()` collected by
 * the build-baked OTELBridge and optionally mirrored to Mountain's
 * dev-log file sink via `RenderDevLog`.
 */

/** Emit a `performance.mark` under the `land:<Tag>:<Message>` namespace. */
export const Trace = (Tag: string, Message: string): void => {
	try {
		performance.mark(`land:${Tag}:${Message}`);
	} catch {}
};

/**
 * Mirror a tagged line into Mountain's dev-log file sink.
 * Fire-and-forget - never awaits, never throws.
 * Sends both casings (`Tag`/`Message` and `tag`/`message`) so Tauri's
 * param-case handling doesn't require a guess.
 */
export const DevLogForward = (Tag: string, Message: string): void => {
	try {
		const Internals = (window as any).__TAURI_INTERNALS__;
		const Invoke =
			(window as any).__TAURI__?.core?.invoke ??
			(window as any).__TAURI__?.invoke ??
			Internals?.invoke;
		if (typeof Invoke !== "function") return;
		Invoke("RenderDevLog", {
			Tag,
			Message,
			tag: Tag,
			message: Message,
		}).catch(() => {});
	} catch {}
};

/**
 * Wrap an async operation with `performance.mark` start/end/error events
 * and a `performance.measure` span. OTELBridge picks up the measure as a
 * span with real wall-clock duration.
 */
export const TimedTrace = async <T>(
	Tag: string,
	Label: string,
	Fn: () => Promise<T>,
): Promise<T> => {
	const MarkName = `land:${Tag}:${Label}`;
	const StartMark = `${MarkName}:start`;
	try {
		performance.mark(StartMark);
	} catch {}
	try {
		const Result = await Fn();
		try {
			performance.measure(MarkName, StartMark);
		} catch {}
		return Result;
	} catch (Error) {
		try {
			performance.mark(`${MarkName}:error`, {
				detail: { error: String(Error) },
			});
		} catch {}
		try {
			performance.measure(MarkName, StartMark);
		} catch {}
		throw Error;
	}
};
