/**
 * @module Wind/Shim/AuditLog
 * @description
 * Service resolution audit log for the Proxy shim level.
 *
 * When TierShim=Proxy, every ServiceCollection.get() and
 * InstantiationService.invokeFunction() call is recorded here.
 * The log is periodically flushed to Mountain's dev log for analysis.
 *
 * Used to build the evidence base for which services can be safely
 * swallowed, how often they're accessed, and by whom.
 */

interface AuditEntry {

	/** Performance.now() timestamp */
	timestamp: number;

	/** Service identifier string (e.g., "IStatusbarService") */
	serviceId: string;

	/** What kind of access */
	action: "get" | "set" | "create" | "resolve" | "invoke";

	/** Was the service successfully resolved? */
	resolved: boolean;

	/** Was it served from cache (previously created)? */
	fromCache: boolean;

	/** Duration in ms (for create/resolve actions) */
	duration?: number;
}

class AuditLog {

	/** Ring buffer of audit entries */
	private static entries: AuditEntry[] = [];

	/** Maximum entries before oldest are dropped */
	private static readonly maxEntries = 2000;

	/** Number of flushes performed */
	private static flushCount = 0;

	/**
	 * Record a service access event.
	 */
	static record(entry: Omit<AuditEntry, "timestamp">): void {
		const e: AuditEntry = { ...entry, timestamp: performance.now() };

		this.entries.push(e);

		if (this.entries.length > this.maxEntries) {
			// Keep the most recent entries
			this.entries = this.entries.slice(-this.maxEntries);
		}
	}

	/**
	 * Flush all entries and return them. Resets the log.
	 */
	static flush(): AuditEntry[] {
		const copy = [...this.entries];

		this.entries = [];

		this.flushCount++;

		return copy;
	}

	/**
	 * Get a summary: total entries and per-service counts.
	 */
	static summary(): {
		total: number;

		byService: Record<string, number>;

		byAction: Record<string, number>;
	} {
		const byService: Record<string, number> = {};

		const byAction: Record<string, number> = {};

		for (const e of this.entries) {
			byService[e.serviceId] = (byService[e.serviceId] || 0) + 1;

			byAction[e.action] = (byAction[e.action] || 0) + 1;
		}

		return {
			total: this.entries.length,

			byService,

			byAction,
		};
	}

	/**
	 * Get entries filtered by service ID.
	 */
	static getByService(serviceId: string): AuditEntry[] {
		return this.entries.filter((e) => e.serviceId.includes(serviceId));
	}

	/**
	 * Get entries filtered by action type.
	 */
	static getByAction(action: AuditEntry["action"]): AuditEntry[] {
		return this.entries.filter((e) => e.action === action);
	}

	/**
	 * Send the current batch to Mountain's dev log via Tauri IPC.
	 * Called periodically (e.g., every 30 seconds) when TierShim=Proxy.
	 */
	static async sendToMountain(): Promise<void> {
		const data = this.flush();

		if (data.length === 0) {
			return;
		}

		try {
			// Access Tauri's global invoke — requires @tauri-apps/api in scope
			const g = globalThis as Record<string, unknown>;

			const tauri = g["__TAURI__"] as Record<string, unknown> | undefined;

			const invoke = ((tauri?.["core"] as Record<string, unknown>)?.[
				"invoke"
			] ?? tauri?.["invoke"]) as
				| ((
						cmd: string,

						args: Record<string, unknown>,
				  ) => Promise<unknown>)

				| undefined;

			if (typeof invoke === "function") {
				const summary = this.summary();

				await invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"shim-audit",
						JSON.stringify({
							flush: this.flushCount,
							...summary,
							sample: data.slice(0, 50),
						}),
					],
				});
			}
		} catch {
			// Don't throw from audit — it's fire-and-forget
		}

		return;
	}

	/**
	 * Number of entries currently in the buffer.
	 */
	static get size(): number {
		return this.entries.length;
	}

	/**
	 * Clear without flushing (for testing).
	 */
	static clear(): void {
		this.entries = [];
	}

	/**
	 * Top N most-accessed services (for discovery).
	 */
	static topServices(n = 20): Array<{ id: string; count: number }> {
		const { byService } = this.summary();

		return Object.entries(byService)
			.sort(([, a], [, b]) => b - a)
			.slice(0, n)
			.map(([id, count]) => ({ id, count }));
	}
}

export { AuditLog };

export type { AuditEntry };
