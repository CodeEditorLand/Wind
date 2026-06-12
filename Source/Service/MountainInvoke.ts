/**
 * @module Service/MountainInvoke
 *
 * Low-level Tauri invoke helpers used by TauriChannel and TauriMainProcessService.
 * Isolated here so the routing layer (TauriMainProcessService) imports a named
 * dependency instead of inlining a raw window.__TAURI__ access.
 */

const _DevLogForward = (Tag: string, Message: string): void => {

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
 * Invoke Mountain's `MountainIPCInvoke` Tauri command with the given
 * `method` and `params` array. Logs failures via `_DevLogForward` then
 * re-throws so callers can handle IPC errors.
 */
export async function InvokeMountain(
	Method: string,

	Params: unknown[],
): Promise<unknown> {

	const Invoke =
		(window as any).__TAURI__?.core?.invoke ??
		(window as any).__TAURI__?.invoke;

	if (typeof Invoke !== "function") return undefined;

	const Start =
		typeof performance !== "undefined" ? performance.now() : Date.now();

	try {
		return await Invoke("MountainIPCInvoke", {
			method: Method,
			params: Params,
		});
	} catch (Error) {
		const Elapsed =
			(typeof performance !== "undefined"
				? performance.now()
				: Date.now()) - Start;

		_DevLogForward(
			"tauri-invoke",

			`[TauriInvoke] method=${Method} ok=false elapsed_ms=${Elapsed.toFixed(2)} err=${String(Error)}`,
		);

		throw Error;
	}
}

/**
 * Forward a call to Cocoon's Node.js runtime via Mountain's `cocoon:request`
 * bridge. Returns `undefined` when the Tauri invoke channel is unavailable.
 */
export async function InvokeViaNode(
	Method: string,

	Params: unknown[],
): Promise<unknown> {

	const Invoke =
		(window as any).__TAURI__?.core?.invoke ??
		(window as any).__TAURI__?.invoke;

	if (typeof Invoke !== "function") return undefined;

	try {
		return await Invoke("MountainIPCInvoke", {
			method: "cocoon:request",
			params: [Method, Params.length === 1 ? Params[0] : Params],
		});
	} catch {
		return undefined;
	}
}
