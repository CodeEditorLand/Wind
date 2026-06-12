/**
 * @module Wind/Shim/RedirectBus
 * @description
 * Event bus that routes swallowed events to the correct Land service.
 * Handlers register for method patterns; when a swallowed event arrives,
 * the first matching handler processes it.
 *
 * Handler registration is lazy — services register during their
 * bootstrap phase. If no handler matches, the event is forwarded
 * to the fallback (Mountain IPC passthrough).
 *
 * This is the CENTRAL NERVOUS SYSTEM of the shim architecture.
 * Every swallowed event flows through here.
 */

import type { RedirectHandler } from "./Type.js";

class RedirectBus {
	/** Registered handlers, ordered by priority (first match wins) */
	private static handlers: RedirectHandler[] = [];

	/**
	 * Register a handler for a method pattern.
	 *
	 * Handlers are checked in registration order. First match wins.
	 * Register more-specific patterns before less-specific ones.
	 *
	 * @param handler - The handler to register
	 */
	static register(handler: RedirectHandler): void {
		// Avoid duplicate registrations
		const existing = this.handlers.findIndex(
			(h) => h.pattern === handler.pattern,
		);
		if (existing >= 0) {
			this.handlers[existing] = handler;
			return;
		}
		this.handlers.push(handler);
	}

	/**
	 * Unregister a handler by pattern.
	 * @param pattern - The pattern to remove
	 */
	static unregister(pattern: string): void {
		this.handlers = this.handlers.filter((h) => h.pattern !== pattern);
	}

	/**
	 * Route a swallowed event to the appropriate handler.
	 *
	 * @param method - IPC method name
	 * @param params - Parameters array
	 * @returns The handler's result, or undefined if no handler matches
	 */
	static async route(
		method: string,
		params: unknown[],
	): Promise<unknown> {
		for (let i = 0; i < this.handlers.length; i++) {
			const handler = this.handlers[i];

			let matches = false;
			try {
				if (
					handler.pattern.startsWith("^") ||
					handler.pattern.includes(".*")
				) {
					matches = new RegExp(handler.pattern).test(method);
				} else {
					matches = method.startsWith(handler.pattern);
				}
			} catch {
				continue;
			}

			if (matches) {
				const currentHandler = handler;
				try {
					return await currentHandler.handle(method, params);
				} catch (error) {
					// Handler threw — log and re-throw
					console.error(
						`[Shim:RedirectBus] Handler for "${currentHandler.pattern}" threw on "${method}":`,
						error,
					);
					throw error;
				}
			}
		}

		// No handler matched — this shouldn't happen if SwallowMap is
		// correctly configured, but is a safe fallback
		console.warn(
			`[Shim:RedirectBus] No handler for swallowed method: ${method}`,
		);
		return undefined;
	}

	/**
	 * Check if any handler is registered for a pattern.
	 */
	static hasHandler(method: string): boolean {
		return this.handlers.some((h) => {
			try {
				if (
					h.pattern.startsWith("^") ||
					h.pattern.includes(".*")
				) {
					return new RegExp(h.pattern).test(method);
				}
				return method.startsWith(h.pattern);
			} catch {
				return false;
			}
		});
	}

	/**
	 * Number of registered handlers.
	 */
	static get handlerCount(): number {
		return this.handlers.length;
	}

	/**
	 * Clear all handlers (for testing/reset).
	 */
	static clear(): void {
		this.handlers = [];
	}
}

export { RedirectBus };
