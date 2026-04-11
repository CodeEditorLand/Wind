/**
 * @module ProcessPolyfill
 *
 * @description
 * Extended polyfill for Node.js process object in the renderer sandbox.
 * Provides comprehensive process information and utilities for the Electron workbench.
 *
 * @feature_set
 * - argv - Command line arguments for workbench
 * - execPath - Application executable path
 * - execArgv - Node.js exec args
 * - env - Environment variables
 * - platform, arch - Platform detection
 * - versions - Node.js, Chrome, Electron versions
 * - pid, ppid - Process IDs
 * - cwd() - Current working directory
 * - hrtime() - High-resolution timer
 * - cpuUsage() - CPU usage
 * - getProcessMemoryInfo() - Memory info
 * - shellEnv() - Shell environment
 * - exit(code) - Process exit
 * - kill(pid, signal) - Kill process
 * - umask(mask) - Umask
 * - on(type, callback) - Event listeners
 *
 * @phase 3 of Approach A3 implementation
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Process versions object
 */
interface ProcessVersions {
	node: string;
	chrome: string;
	electron: string;
	v8?: string;
	uv?: string;
	zlib?: string;
	brotli?: string;
	ares?: string;
	modules?: string;
	nghttp2?: string;
	napi?: string;
	openssl?: string;
}

/**
 * Process CPU usage snapshot
 */
interface ProcessCpuUsage {
	user: number;
	system: number;
}

/**
 * Process memory info
 */
interface ProcessMemoryInfo {
	workingSetSize: number;
	peakWorkingSetSize: number;
	privateBytes: number;
	sharedBytes: number;
	residentSet: number;
	heapTotal?: number;
	heapUsed?: number;
	external?: number;
	arrayBuffers?: number;
}

/**
 * Process event types
 */
type ProcessEventType =
	| "beforeExit"
	| "disconnect"
	| "exit"
	| "message"
	| "multipleResolves"
	| "rejectionHandled"
	| "uncaughtException"
	| "unhandledRejection"
	| "warning"
	| "worker";

/**
 * Process event listener function
 */
type ProcessEventListener = (...args: unknown[]) => void;

/**
 * Process configuration
 */
interface ProcessConfig {
	execPath?: string;
	execArgv?: string[];
	env?: Record<string, string>;
	platform?: string;
	arch?: string;
	version?: ProcessVersions;
	pid?: number;
	ppid?: number;
	title?: string;
}

// ============================================================================
// Tauri Integration
// ============================================================================

/**
 * Invoke Tauri command with proper error handling
 */
async function invokeTauri<T>(
	command: string,
	args: Record<string, unknown> = {},
): Promise<T> {
	try {
		// Tauri 2.x: core.invoke, Tauri 1.x: invoke
		const Invoke =
			(window as any).__TAURI__?.core?.invoke ??
			(window as any).__TAURI__?.invoke ??
			(window as any).TAURI?.invoke;

		if (typeof Invoke === "function") {
			return await Invoke(command, args);
		}

		throw new Error(`Tauri invoke not available for command: ${command}`);
	} catch (error: unknown) {
		throw error;
	}
}

// ============================================================================
// Process Configuration
// ============================================================================

/**
 * Default process configuration
 */
const DEFAULT_PROCESS_CONFIG: ProcessConfig = {
	execPath: "/Applications/CodeEditorLand.app/Contents/MacOS/codeeditorland",
	execArgv: [],
	env: {
		PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
		HOME: "/Users/test",
		USER: "test",
		SHELL: "/bin/zsh",
		TMPDIR: "/tmp",
		TMP: "/tmp",
		TEMP: "/tmp",
		NODE_ENV: "production",
		// Tells the Electron workbench to use relative imports
		// instead of vscode-file:// URLs (WKWebView can't import()
		// from custom schemes). Paired with _VSCODE_USE_RELATIVE_IMPORTS
		// set in Base.astro.
		VSCODE_DEV: "true",
	},
	platform: "darwin",
	arch: "arm64",
	pid: 1,
	ppid: 0,
};

/**
 * Get process configuration from Tauri or use defaults
 */
async function getProcessConfiguration(): Promise<ProcessConfig> {
	try {
		if (typeof (window as any).__TAURI__ !== "undefined") {
			// Try to get actual process info from Tauri
			const [execPath, platform, arch, pid] = await Promise.allSettled([
				invokeTauri<string>("process_get_exec_path", {}),
				invokeTauri<string>("process_get_platform", {}),
				invokeTauri<string>("process_get_arch", {}),
				invokeTauri<number>("process_get_pid", {}),
			]);

			return {
				...DEFAULT_PROCESS_CONFIG,
				...(execPath.status === "fulfilled" && {
					execPath: execPath.value,
				}),
				...(platform.status === "fulfilled" && {
					platform: platform.value,
				}),
				...(arch.status === "fulfilled" && { arch: arch.value }),
				...(pid.status === "fulfilled" && { pid: pid.value }),
			};
		}
	} catch (error) {
	}

	return DEFAULT_PROCESS_CONFIG;
}

// ============================================================================
// Version Detection
// ============================================================================

/**
 * Detect Chrome version from user agent
 */
function detectChromeVersion(): string {
	const match = navigator.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
	return match ? match[1] : "0.0.0.0";
}

/**
 * Create versions object
 */
function createVersions(): ProcessVersions {
	const chromeVersion = detectChromeVersion();

	return {
		node: "20.11.0",
		chrome: chromeVersion,
		electron: "31.0.0",
		v8: "12.4.254.20",
		uv: "1.46.1",
		zlib: "1.2.13.1-motley",
		brotli: "1.0.9",
		ares: "1.21.0",
		modules: "127",
		nghttp2: "1.59.0",
		napi: "9",
		openssl: "3.0.13+quic",
	};
}

// ============================================================================
// HRTime Implementation
// ============================================================================

/**
 * High-resolution timer state
 */
// Defer — process may not exist at module evaluation time.
// Wind Install.ts sets window.vscode.process but not globalThis.process;
// that happens later when installProcessPolyfill() runs.
let hrtimeStart: [number, number] = [0, 0];

/**
 * Get high-resolution time in [seconds, nanoseconds]
 * Based on performance.now() for browser compatibility
 */
function hrtime(time?: [number, number]): [number, number] {
	const now = performance.now() * 1e6; // Convert to nanoseconds
	const seconds = Math.floor(now / 1e9);
	const nanoseconds = Math.floor(now % 1e9);

	if (time) {
		const diff = now - (time[0] * 1e9 + time[1]);
		return [Math.floor(diff / 1e9), Math.floor(diff % 1e9)];
	}

	return [seconds, nanoseconds];
}

// ============================================================================
// CPU Usage Tracking
// ============================================================================

/**
 * Last CPU usage snapshot for diff calculation
 */
let lastCpuUsage: ProcessCpuUsage | null = null;

/**
 * Get process CPU usage
 */
function cpuUsage(previousValue?: ProcessCpuUsage): ProcessCpuUsage {
	// In a browser environment, we can only approximate CPU usage
	// This is a simplified implementation
	const user = Math.floor(Math.random() * 10000); // Mock user CPU time
	const system = Math.floor(Math.random() * 5000); // Mock system CPU time

	if (previousValue && lastCpuUsage) {
		// Calculate diff from previous value
		return {
			user: user - previousValue.user,
			system: system - previousValue.system,
		};
	}

	lastCpuUsage = { user, system };
	return { user, system };
}

// ============================================================================
// Process Class
// ============================================================================

/**
 * ProcessPolyfill class implementing Node.js process object
 */
class ProcessPolyfill {
	// Core properties
	public readonly platform: string;
	public readonly arch: string;
	public readonly version: string;
	public readonly versions: ProcessVersions;
	public readonly pid: number;
	public readonly ppid: number;
	public execPath: string;
	public execArgv: string[];
	public env: Record<string, string>;
	public title: string;

	// Event listener storage
	private listeners: Map<ProcessEventType, Set<ProcessEventListener>> =
		new Map();

	// Process state
	private _exitCode: number | null = null;
	private _exited: boolean = false;

	constructor(config: ProcessConfig) {
		// Initialize core properties
		this.platform =
			config.platform ?? DEFAULT_PROCESS_CONFIG.platform ?? "darwin";
		this.arch = config.arch ?? DEFAULT_PROCESS_CONFIG.arch ?? "x64";
		this.version = "v20.11.0";
		this.versions = createVersions();
		this.pid = config.pid ?? DEFAULT_PROCESS_CONFIG.pid ?? 1;
		this.ppid = config.ppid ?? DEFAULT_PROCESS_CONFIG.ppid ?? 0;
		this.execPath =
			config.execPath ?? DEFAULT_PROCESS_CONFIG.execPath ?? "";
		this.execArgv =
			config.execArgv ?? DEFAULT_PROCESS_CONFIG.execArgv ?? [];
		this.env = config.env ?? DEFAULT_PROCESS_CONFIG.env ?? {};
		this.title = "codeeditorland";

		// Add additional process properties
		this.setUpProcessProperties();
	}

	/**
	 * Set up additional process properties
	 */
	private setUpProcessProperties(): void {
		// Process arguments (empty in renderer process)
		Object.defineProperty(this, "argv", {
			value: [],
			writable: false,
			enumerable: true,
			configurable: false,
		});

		// Browser property for Node.js compatibility
		Object.defineProperty(this, "browser", {
			value: true,
			writable: false,
			enumerable: true,
			configurable: false,
		});

		// Type of process
		Object.defineProperty(this, "type", {
			value: "renderer",
			writable: false,
			enumerable: true,
			configurable: false,
		});

		// Release information
		Object.defineProperty(this, "release", {
			value: {
				name: "node",
				sourceUrl:
					"https://nodejs.org/download/release/v20.11.0/node-v20.11.0.tar.gz",
				headersUrl:
					"https://nodejs.org/download/release/v20.11.0/node-v20.11.0-headers.tar.gz",
				libUrl: "https://nodejs.org/download/release/v20.11.0/node-v20.11.0-darwin-arm64.tar.gz",
			},
			writable: false,
			enumerable: true,
			configurable: false,
		});

		// Features
		Object.defineProperty(this, "features", {
			value: {
				debug: false,
				inspector: true,
				uv: true,
				ipv6: true,
				tls_alpn: true,
				tls_sni: true,
				tls_ocsp: true,
				tls: true,
			},
			writable: false,
			enumerable: true,
			configurable: false,
		});

		// Set up hrtime function
		this.hrtime = hrtime;
	}

	// ============================================================================
	// Methods
	// ============================================================================

	/**
	 * Get current working directory
	 */
	cwd(): string {
		return this.env.HOME ?? this.env.PWD ?? "/";
	}

	/**
	 * High-resolution timer
	 */
	hrtime: (time?: [number, number]) => [number, number] = hrtime;

	/**
	 * Get process memory info (Electron-specific)
	 */
	getProcessMemoryInfo(): Promise<ProcessMemoryInfo> {
		return invokeTauri<ProcessMemoryInfo>(
			"process_get_memory_info",
			{},
		).catch((error) => {
			// Return mocked values
			return {
				workingSetSize: 100 * 1024 * 1024, // 100MB
				peakWorkingSetSize: 150 * 1024 * 1024, // 150MB
				privateBytes: 80 * 1024 * 1024, // 80MB
				sharedBytes: 20 * 1024 * 1024, // 20MB
				residentSet: 100 * 1024 * 1024, // 100MB
			};
		});
	}

	/**
	 * Get CPU usage
	 */
	cpuUsage(previousValue?: ProcessCpuUsage): ProcessCpuUsage {
		return cpuUsage(previousValue);
	}

	/**
	 * Get shell environment variables
	 */
	async shellEnv(): Promise<Record<string, string>> {
		try {
			return await invokeTauri<Record<string, string>>(
				"process_get_shell_env",
				{},
			);
		} catch (error) {
			return this.env;
		}
	}

	/**
	 * Umask - not supported in browser
	 */
	umask(mask?: number): number {
		return 0o022;
	}

	/**
	 * Exit the process - not supported in browser
	 */
	exit(code?: number): never {
		this._exitCode = code ?? 0;
		this._exited = true;

		// Emit 'exit' event
		this.emit("exit", this._exitCode);

		// In browser, we can't actually exit, so we reload or close
		if (typeof window !== "undefined") {
			window.close();
		}

		throw new Error(`Process cannot exit in browser environment`);
	}

	/**
	 * Kill a process
	 */
	kill(pid: number, signal?: string | number): boolean {

		try {
			// Try to kill via Tauri
			invokeTauri("process_kill", { pid, signal }).catch(() => {
				// Ignore errors
			});
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Next tick - schedules callback to run in next event loop iteration
	 */
	nextTick(callback: (...args: unknown[]) => void, ...args: unknown[]): void {
		if (typeof queueMicrotask === "function") {
			queueMicrotask(() => callback(...args));
		} else {
			Promise.resolve().then(() => callback(...args));
		}
	}

	/**
	 * Set process title
	 */
	setTitle(title: string): void {
		this.title = title;
		// In browser, we can update document.title
		if (typeof document !== "undefined") {
			document.title = title;
		}
	}

	/**
	 * Get process title
	 */
	getTitle(): string {
		return this.title;
	}

	// ============================================================================
	// Event Methods
	// ============================================================================

	/**
	 * Add event listener
	 */
	on(event: ProcessEventType, listener: ProcessEventListener): this {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)!.add(listener);
		return this;
	}

	/**
	 * Add one-time event listener
	 */
	once(event: ProcessEventType, listener: ProcessEventListener): this {
		const wrappedListener: ProcessEventListener = (...args) => {
			this.removeListener(event, wrappedListener);
			listener(...args);
		};
		return this.on(event, wrappedListener);
	}

	/**
	 * Remove event listener
	 */
	removeListener(
		event: ProcessEventType,
		listener: ProcessEventListener,
	): this {
		const listeners = this.listeners.get(event);
		if (listeners) {
			listeners.delete(listener);
			if (listeners.size === 0) {
				this.listeners.delete(event);
			}
		}
		return this;
	}

	/**
	 * Remove all listeners for an event
	 */
	removeAllListeners(event?: ProcessEventType): this {
		if (event) {
			this.listeners.delete(event);
		} else {
			this.listeners.clear();
		}
		return this;
	}

	/**
	 * Emit event to all listeners
	 */
	private emit(event: ProcessEventType, ...args: unknown[]): boolean {
		const listeners = this.listeners.get(event);
		if (!listeners || listeners.size === 0) {
			return false;
		}

		listeners.forEach((listener) => {
			try {
				listener(...args);
			} catch (error) {
			}
		});

		return true;
	}

	// ============================================================================
	// Getters
	// ============================================================================

	get exitCode(): number | null {
		return this._exitCode;
	}

	get exited(): boolean {
		return this._exited;
	}

	get connected(): boolean {
		// In browser renderer process, always "connected"
		return true;
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let processInstance: ProcessPolyfill | null = null;
let processConfigPromise: Promise<ProcessConfig> | null = null;

/**
 * Get or create the process singleton
 */
export async function getProcess(): Promise<ProcessPolyfill> {
	if (!processInstance) {
		if (!processConfigPromise) {
			processConfigPromise = getProcessConfiguration();
		}
		const config = await processConfigPromise;
		processInstance = new ProcessPolyfill(config);
	}
	return processInstance;
}

/**
 * Get process synchronously (may return basic instance)
 */
export function getProcessSync(): ProcessPolyfill {
	if (!processInstance) {
		processInstance = new ProcessPolyfill(DEFAULT_PROCESS_CONFIG);
	}
	return processInstance;
}

// ============================================================================
// Installation
// ============================================================================

/**
 * Install the process polyfill
 */
export async function installProcessPolyfill(): Promise<void> {
	if (typeof window === "undefined") {
		return;
	}

	// Prevent double installation
	if ((window as any).__PROCESS_POLYFILL_INSTALLED__) {
		return;
	}
	(window as any).__PROCESS_POLYFILL_INSTALLED__ = true;
	// Get process configuration and create instance
	const proc = await getProcess();

	// Attach to global window for VSCode
	try {
		// Make process available globally
		(window as any).process = proc;

		// Also attach to window.vscode if available
		if (typeof (window as any).vscode !== "undefined") {
			(window as any).vscode.process = proc;
		}
	} catch (error) {
	}
}

/**
 * Install process polyfill synchronously
 */
export function installProcessPolyfillSync(): void {
	if (typeof window === "undefined") {
		return;
	}

	if ((window as any).__PROCESS_POLYFILL_INSTALLED__) {
		return;
	}
	(window as any).__PROCESS_POLYFILL_INSTALLED__ = true;

	const proc = getProcessSync();
	(window as any).process = proc;

	if (typeof (window as any).vscode !== "undefined") {
		(window as any).vscode.process = proc;
	}
}

// ============================================================================
// Exports
// ============================================================================

export { ProcessPolyfill };

export default {
	install: installProcessPolyfill,
	installSync: installProcessPolyfillSync,
	get: getProcess,
	getSync: getProcessSync,
};

// Auto-install on import (async)
if (typeof window !== "undefined") {
	installProcessPolyfill().catch((error) => {
		// Fallback to sync installation
		installProcessPolyfillSync();
	});
}
