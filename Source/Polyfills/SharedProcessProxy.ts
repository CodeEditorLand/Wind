/**
 * @module SharedProcessProxy
 *
 * @description
 * Polyfill for Electron's shared process.
 * The shared process in VSCode handles:
 * - Remote extension host requests
 * - Search service
 * - Debug service
 * - Other background services
 *
 * In Tauri, these services are routed to Cocoon via gRPC.
 *
 * @service_map
 * - IExtensionHostService → Cocoon extension host via gRPC
 * - ISearchService → Cocoon search service via gRPC
 * - IDebugService → Cocoon debug service via gRPC
 * - IStorageService → Mountain storage service
 * - IUpdateService → Mountain update service
 *
 * @phase 6 of Approach A3 implementation
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Shared process service type
 */
type SharedProcessService = 
	| "extension-host"
	| "search"
	| "debug"
	| "storage"
	| "update"
	| "telemetry"
	| "remote-ssh"
	| "remote-tunnel"
	| "webview"
	| "terminal"
	| "sharedProcess";

/**
 * Shared process message
 */
interface SharedProcessMessage {
	service: SharedProcessService;
	method: string;
	args?: unknown[];
	correlationId?: string;
}

/**
 * Shared process response
 */
interface SharedProcessResponse {
	success: boolean;
	data?: unknown;
	error?: string;
	correlationId?: string;
}

/**
 * Service proxy interface
 */
interface ServiceProxy {
	service: SharedProcessService;
	ready: boolean;
	healthCheck(): Promise<boolean>;
	invoke(method: string, ...args: unknown[]): Promise<unknown>;
	on(event: string, handler: (...args: unknown[]) => void): void;
	once(event: string, handler: (...args: unknown[]) => void): void;
	removeListener(event: string, handler: (...args: unknown[]) => void): void;
	removeAllListeners(event?: string): void;
}

// ============================================================================
// Tauri Integration
// ============================================================================

/**
 * Invoke Tauri command with proper error handling
 */
async function invokeTauri<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
	try {
		if (typeof (window as any).__TAURI__?.invoke !== "undefined") {
			return await (window as any).__TAURI__.invoke<T>(command, args);
		}
		
		if (typeof (window as any).TAURI?.invoke !== "undefined") {
			return await (window as any).TAURI.invoke<T>(command, args);
		}
		
		throw new Error(`Tauri invoke not available for command: ${command}`);
	} catch (error: unknown) {
		console.error(`[SharedProcessProxy] Tauri invoke failed for ${command}:`, error);
		throw error;
	}
}

/**
 * Listen for Tauri events
 */
function listenToTauri(event: string, handler: (payload: unknown) => void): () => void {
	if (typeof (window as any).__TAURI__?.event?.listen === "function") {
		const unlistenPromise = (window as any).__TAURI__.event.listen(event, ({ payload }: { payload: unknown }) => {
			handler(payload);
		});
		
		return () => {
			unlistenPromise.then((unlisten: () => void) => unlisten());
		};
	}
	
	if (typeof (window as any).TAURI?.event?.listen === "function") {
		const unlistenPromise = (window as any).TAURI.event.listen(event, ({ payload }: { payload: unknown }) => {
			handler(payload);
		});
		
		return () => {
			unlistenPromise.then((unlisten: () => void) => unlisten());
		};
	}
	
	console.warn(`[SharedProcessProxy] Tauri event listener not available for: ${event}`);
	return () => {};
}

// ============================================================================
// Service Proxy Implementation
// ============================================================================

/**
 * Create a service proxy for a specific shared process service
 */
function createServiceProxy(service: SharedProcessService): ServiceProxy {
	const listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
	const pendingRequests: Map<string, { resolve: (value: unknown) => void; reject: (error: Error) => void }> = new Map();
	
	let isReady = false;
	
	// Listen for responses on this service
	const unlistenResponse = listenToTauri(`shared_process:response:${service}`, (payload: unknown) => {
		const response = payload as SharedProcessResponse;
		
		if (response.correlationId && pendingRequests.has(response.correlationId)) {
			const pending = pendingRequests.get(response.correlationId)!;
			
			if (response.success) {
				pending.resolve(response.data);
			} else {
				pending.reject(new Error(response.error ?? "Unknown error"));
			}
			
			pendingRequests.delete(response.correlationId);
		}
	});
	
	// Listen for events from this service
	const unlistenEvent = listenToTauri(`shared_process:event:${service}`, (payload: unknown) => {
		const event = payload as { event: string; args: unknown[] };
		emitEvent(event.event, ...event.args);
	});
	
	/**
	 * Emit event to all listeners
	 */
	function emitEvent(event: string, ...args: unknown[]): void {
		const eventListeners = listeners.get(event);
		if (eventListeners) {
			eventListeners.forEach((listener) => {
				try {
					listener(...args);
				} catch (error) {
					console.error(`[SharedProcessProxy] Error in ${service} event listener (${event}):`, error);
				}
			});
		}
	}
	
	/**
	 * Generate correlation ID for request-response pattern
	 */
	function generateCorrelationId(): string {
		return `${service}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
	}
	
	return {
		service,
		get ready() {
			return isReady;
		},
		set ready(value: boolean) {
			isReady = value;
		},
		
		/**
		 * Health check for the service
		 */
		async healthCheck(): Promise<boolean> {
			try {
				if (service === "extension-host") {
					return await invokeTauri<boolean>("cocoon:extension_host_health", {});
				} else if (service === "search") {
					return await invokeTauri<boolean>("cocoon:search_service_health", {});
				} else if (service === "debug") {
					return await invokeTauri<boolean>("cocoon:debug_service_health", {});
				} else {
					return await invokeTauri<boolean>("shared_process:service_health", { service });
				}
			} catch {
				return false;
			}
		},
		
		/**
		 * Invoke a method on the service
		 */
		async invoke(method: string, ...args: unknown[]): Promise<unknown> {
			const correlationId = generateCorrelationId();
			
			const request: SharedProcessMessage = {
				service,
				method,
				args,
				correlationId,
			};
			
			// Create promise for response
			return new Promise((resolve, reject) => {
				pendingRequests.set(correlationId, { resolve, reject });
				
				// Send request to Tauri
				invokeTauri("shared_process:invoke", request).catch((error) => {
					pendingRequests.delete(correlationId);
					reject(error);
				});
			});
		},
		
		/**
		 * Register event listener
		 */
		on(event: string, handler: (...args: unknown[]) => void): void {
			if (!listeners.has(event)) {
				listeners.set(event, new Set());
			}
			listeners.get(event)!.add(handler);
		},
		
		/**
		 * Register one-time event listener
		 */
		once(event: string, handler: (...args: unknown[]) => void): void {
			const wrappedHandler: (...args: unknown[]) => void = (...args) => {
				handler(...args);
				this.removeListener(event, wrappedHandler);
			};
			this.on(event, wrappedHandler);
		},
		
		/**
		 * Remove event listener
		 */
		removeListener(event: string, handler: (...args: unknown[]) => void): void {
			const eventListeners = listeners.get(event);
			if (eventListeners) {
				eventListeners.delete(handler);
				if (eventListeners.size === 0) {
					listeners.delete(event);
				}
			}
		},
		
		/**
		 * Remove all event listeners
		 */
		removeAllListeners(event?: string): void {
			if (event) {
				listeners.delete(event);
			} else {
				listeners.clear();
			}
		},
	};
}

// ============================================================================
// Extension Host Service
// ============================================================================

/**
 * Extension host service proxy
 * Routes extension host operations to Cocoon
 */
export const ExtensionHostService: ServiceProxy = Object.assign(
	createServiceProxy("extension-host"),
	{
		/**
		 * Start extension host
		 */
		async start(extensionId: string): Promise<boolean> {
			return await this.invoke("start", extensionId) as Promise<boolean>;
		},
		
		/**
		 * Stop extension host
		 */
		async stop(extensionId: string): Promise<boolean> {
			return await this.invoke("stop", extensionId) as Promise<boolean>;
		},
		
		/**
		 * Restart extension host
		 */
		async restart(extensionId: string): Promise<boolean> {
			return await this.invoke("restart", extensionId) as Promise<boolean>;
		},
		
		/**
		 * Call extension API
		 */
		async callExtensionAPI(extensionId: string, method: string, ...args: unknown[]): Promise<unknown> {
			return await this.invoke("callAPI", extensionId, method, ...args);
		},
		
		/**
		 * Get extension host status
		 */
		async getStatus(): Promise<{ running: boolean; extensions: string[] }> {
			return await this.invoke("getStatus") as Promise<{ running: boolean; extensions: string[] }>;
		},
	},
);

// ============================================================================
// Search Service
// ============================================================================

/**
 * Search service proxy
 * Routes search operations to Cocoon
 */
export const SearchService: ServiceProxy = Object.assign(
	createServiceProxy("search"),
	{
		/**
		 * Perform search
		 */
		async search(query: string, options?: unknown): Promise<unknown[]> {
			return await this.invoke("search", query, options) as Promise<unknown[]>;
		},
		
		/**
		 * Get search index status
		 */
		async getIndexStatus(): Promise<{ ready: boolean; documents: number }> {
			return await this.invoke("getIndexStatus") as Promise<{ ready: boolean; documents: number }>;
		},
		
		/**
		 * Clear search index
		 */
		async clearIndex(): Promise<boolean> {
			return await this.invoke("clearIndex") as Promise<boolean>;
		},
	},
);

// ============================================================================
// Debug Service
// ============================================================================

/**
 * Debug service proxy
 * Routes debug operations to Cocoon
 */
export const DebugService: ServiceProxy = Object.assign(
	createServiceProxy("debug"),
	{
		/**
		 * Start debug session
		 */
		async startSession(configuration: unknown): Promise<string> {
			return await this.invoke("startSession", configuration) as Promise<string>;
		},
		
		/**
		 * Stop debug session
		 */
		async stopSession(sessionId: string): Promise<boolean> {
			return await this.invoke("stopSession", sessionId) as Promise<boolean>;
		},
		
		/**
		 * Send debug command
		 */
		async sendCommand(sessionId: string, command: string, ...args: unknown[]): Promise<unknown> {
			return await this.invoke("sendCommand", sessionId, command, ...args);
		},
		
		/**
		 * Get active debug sessions
		 */
		async getActiveSessions(): Promise<Array<{ id: string; name: string }>> {
			return await this.invoke("getActiveSessions") as Promise<Array<{ id: string; name: string }>>;
		},
	},
);

// ============================================================================
// Storage Service
// ============================================================================

/**
 * Storage service proxy
 * Routes storage operations to Mountain
 */
export const StorageService: ServiceProxy = Object.assign(
	createServiceProxy("storage"),
	{
		/**
		 * Get item from storage
		 */
		async getItem(key: string): Promise<string | null> {
			return await invokeTauri<string | null>("storage:get_item", { key });
		},
		
		/**
		 * Set item in storage
		 */
		async setItem(key: string, value: string): Promise<boolean> {
			return await invokeTauri<boolean>("storage:set_item", { key, value });
		},
		
		/**
		 * Remove item from storage
		 */
		async removeItem(key: string): Promise<boolean> {
			return await invokeTauri<boolean>("storage:remove_item", { key });
		},
		
		/**
		 * Get all items in storage
		 */
		async getAllItems(): Promise<Record<string, string>> {
			return await invokeTauri<Record<string, string>>("storage:get_all_items", {});
		},
		
		/**
		 * Clear all storage
		 */
		async clear(): Promise<boolean> {
			return await invokeTauri<boolean>("storage:clear", {});
		},
	},
);

// ============================================================================
// Update Service
// ============================================================================

/**
 * Update service proxy
 * Routes update operations to Mountain
 */
export const UpdateService: ServiceProxy = Object.assign(
	createServiceProxy("update"),
	{
		/**
		 * Check for updates
		 */
		async checkForUpdates(): Promise<{ available: boolean; version?: string }> {
			return await invokeTauri<{ available: boolean; version?: string }>("update:check", {});
		},
		
		/**
		 * Download update
		 */
		async downloadUpdate(): Promise<boolean> {
			return await invokeTauri<boolean>("update:download", {});
		},
		
		/**
		 * Install update
		 */
		async installUpdate(): Promise<boolean> {
			return await invokeTauri<boolean>("update:install", {});
		},
		
		/**
		 * Get update status
		 */
		async getStatus(): Promise<{ state: string; progress: number }> {
			return await invokeTauri<{ state: string; progress: number }>("update:get_status", {});
		},
	},
);

// ============================================================================
// Shared Process Manager
// ============================================================================

/**
 * Shared process manager
 * Manages all shared process services
 */
class SharedProcessManager {
	// Service proxies
	private services: Map<SharedProcessService, ServiceProxy> = new Map();
	
	// Health check interval
	private healthCheckInterval: number | null = null;
	
	constructor() {
		// Register default services
		this.registerService(ExtensionHostService);
		this.registerService(SearchService);
		this.registerService(DebugService);
		this.registerService(StorageService);
		this.registerService(UpdateService);
	}
	
	/**
	 * Register a service proxy
	 */
	registerService(proxy: ServiceProxy): void {
		this.services.set(proxy.service, proxy);
		console.log(`[SharedProcessProxy] Registered service: ${proxy.service}`);
	}
	
	/**
	 * Get service proxy
	 */
	getService(service: SharedProcessService): ServiceProxy | undefined {
		return this.services.get(service);
	}
	
	/**
	 * Get all services
	 */
	getAllServices(): Map<SharedProcessService, ServiceProxy> {
		return new Map(this.services);
	}
	
	/**
	 * Start health checks
	 */
	startHealthChecks(intervalMs: number = 30000): void {
		if (this.healthCheckInterval !== null) {
			return;
		}
		
		this.healthCheckInterval = window.setInterval(async () => {
			console.log("[SharedProcessProxy] Running health checks for all services");
			
			for (const [serviceName, proxy] of this.services.entries()) {
				try {
					const isHealthy = await proxy.healthCheck();
					proxy.ready = isHealthy;
					
					if (!isHealthy) {
						console.warn(`[SharedProcessProxy] Service ${serviceName} is unhealthy`);
					}
				} catch (error) {
					console.error(`[SharedProcessProxy] Health check failed for ${serviceName}:`, error);
					proxy.ready = false;
				}
			}
		}, intervalMs);
		
		console.log("[SharedProcessProxy] Health checks started");
	}
	
	/**
	 * Stop health checks
	 */
	stopHealthChecks(): void {
		if (this.healthCheckInterval !== null) {
			clearInterval(this.healthCheckInterval);
			this.healthCheckInterval = null;
			console.log("[SharedProcessProxy] Health checks stopped");
		}
	}
	
	/**
	 * Initialize all services
	 */
	async initialize(): Promise<void> {
		console.log("[SharedProcessProxy] Initializing shared process services...");
		
		for (const [serviceName, proxy] of this.services.entries()) {
			try {
				const isHealthy = await proxy.healthCheck();
				proxy.ready = isHealthy;
				console.log(`[SharedProcessProxy] Service ${serviceName}: ${isHealthy ? "ready" : "not ready"}`);
			} catch (error) {
				console.warn(`[SharedProcessProxy] Failed to initialize ${serviceName}:`, error);
				proxy.ready = false;
			}
		}
		
		// Start health checks
		this.startHealthChecks();
		
		console.log("[SharedProcessProxy] Shared process services initialized");
	}
	
	/**
	 * Shutdown all services
	 */
	async shutdown(): Promise<void> {
		console.log("[SharedProcessProxy] Shutting down shared process services...");
		
		this.stopHealthChecks();
		
		// Remove all listeners
		for (const proxy of this.services.values()) {
			proxy.removeAllListeners();
		}
		
		console.log("[SharedProcessProxy] Shared process services shut down");
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let sharedProcessManager: SharedProcessManager | null = null;

/**
 * Get or create the shared process manager
 */
export function getSharedProcessManager(): SharedProcessManager {
	if (!sharedProcessManager) {
		sharedProcessManager = new SharedProcessManager();
		console.log("[SharedProcessProxy] SharedProcessManager instance created");
	}
	return sharedProcessManager;
}

// ============================================================================
// Installation
// ============================================================================

/**
 * Install the shared process proxy
 */
export async function installSharedProcessProxy(): Promise<void> {
	if (typeof window === "undefined") {
		return;
	}

	// Prevent double installation
	if ((window as any).__SHARED_PROCESS_PROXY_INSTALLED__) {
		console.log("[SharedProcessProxy] Already installed, skipping");
		return;
	}
	(window as any).__SHARED_PROCESS_PROXY_INSTALLED__ = true;

	console.log("[SharedProcessProxy] Installing shared process proxy...");

	// Get shared process manager
	const manager = getSharedProcessManager();

	// Initialize services
	await manager.initialize();

	// Attach to window.vscode if available
	if (typeof (window as any).vscode !== "undefined") {
		(window as any).vscode.sharedProcess = {
			manager,
			ExtensionHostService,
			SearchService,
			DebugService,
			StorageService,
			UpdateService,
		};
	}
	
	// Make services globally available
	(window as any).__SHARED_PROCESS__ = {
		manager,
		ExtensionHostService,
		SearchService,
		DebugService,
		StorageService,
		UpdateService,
	};

	console.log("[SharedProcessProxy] ✓ Shared process proxy installed");
}

// ============================================================================
// Exports
// ============================================================================

export default {
	install: installSharedProcessProxy,
	getManager: getSharedProcessManager,
	
	// Service exports
	ExtensionHostService,
	SearchService,
	DebugService,
	StorageService,
	UpdateService,
	
	// Types
	SharedProcessManager,
};

// Auto-install on import
if (typeof window !== "undefined") {
	installSharedProcessProxy().catch((error) => {
		console.error("[SharedProcessProxy] Failed to auto-install:", error);
	});
}
