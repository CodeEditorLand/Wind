/**
 * @module ChildProcessPolyfill
 *
 * @description
 * Polyfill for Node.js child_process module in the renderer sandbox.
 * Maps child process operations to Mountain and Cocoon commands.
 *
 * @feature_set
 * - spawn(command, args, options) → Mountain electron:spawn_child_process
 * - exec(command, options) → Mountain electron:exec_command
 * - fork(modulePath, args, options) → Mountain electron:fork_extension_host (for Cocoon)
 *
 * @return_types
 * ChildProcess-like objects with:
 * - pid, killed, exitCode, signalCode
 * - stdin, stdout, stderr (mock with event handling)
 * - on(event, listener), emit(event, ...args)
 * - kill(signal)
 *
 * @phase 5 of Approach A3 implementation
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Spawn options
 */
interface SpawnOptions {
	cwd?: string;
	env?: Record<string, string>;
	stdio?: Array<"pipe" | "ignore" | "inherit" | Stream | number | null> | "pipe" | "ignore" | "inherit";
	detached?: boolean;
	shell?: boolean | string;
	windowsVerbatimArguments?: boolean;
	windowsHide?: boolean;
	uid?: number;
	gid?: number;
	serialization?: "json" | "advanced";
}

/**
 * Exec options
 */
interface ExecOptions {
	cwd?: string;
	env?: Record<string, string>;
	encoding?: BufferEncoding;
	timeout?: number;
	maxBuffer?: number;
	killSignal?: string;
	uid?: number;
	gid?: number;
	shell?: string | boolean;
	windowsHide?: boolean;
}

/**
 * Fork options
 */
interface ForkOptions {
	cwd?: string;
	env?: Record<string, string>;
	execPath?: string;
	execArgv?: string[];
	silent?: boolean;
	stdio?: Array<"pipe" | "ignore" | "inherit" | Stream | number | null> | "pipe" | "ignore" | "inherit";
	detached?: boolean;
	windowsVerbatimArguments?: boolean;
	windowsHide?: boolean;
	uid?: number;
	gid?: number;
	serialization?: "json" | "advanced";
}

/**
 * Kill signals
 */
type SignalNumber =
	| 1 // SIGHUP
	| 2 // SIGINT
	| 3 // SIGQUIT
	| 9 // SIGKILL
	| 10 // SIGUSR1
	| 12 // SIGUSR2
	| 15 // SIGTERM
	| 17 // SIGSTOP
	| 19; // SIGCONT

type SignalString =
	| "SIGHUP"
	| "SIGINT"
	| "SIGQUIT"
	| "SIGILL"
	| "SIGTRAP"
	| "SIGABRT"
	| "SIGIOT"
	| "SIGBUS"
	| "SIGFPE"
	| "SIGKILL"
	| "SIGUSR1"
	| "SIGSEGV"
	| "SIGUSR2"
	| "SIGPIPE"
	| "SIGALRM"
	| "SIGTERM"
	| "SIGCHLD"
	| "SIGCONT"
	| "SIGSTOP"
	| "SIGTSTP"
	| "SIGTTIN"
	| "SIGTTOU"
	| "SIGURG"
	| "SIGXCPU"
	| "SIGXFSZ"
	| "SIGVTALRM"
	| "SIGPROF"
	| "SIGWINCH"
	| "SIGIO"
	| "SIGPOLL"
	| "SIGPWR"
	| "SIGSYS";

type Signal = SignalNumber | SignalString;

/**
 * Child process event types
 */
type ChildProcessEvent = 
	| "close"
	| "disconnect"
	| "error"
	| "exit"
	| "message"
	| "spawn";

/**
 * Child process event listener
 */
type ChildProcessEventListener = (...args: unknown[]) => void;

/**
 * Mock Stream for stdin/stdout/stderr
 */
interface Stream {
	write(data: string | Buffer): boolean;
	end(data?: string | Buffer): void;
	on(event: string, listener: (...args: unknown[]) => void): void;
	removeAllListeners(event?: string): void;
	stdio?: Stream;
	fd?: number;
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
		console.error(`[ChildProcessPolyfill] Tauri invoke failed for ${command}:`, error);
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
		
		// Return cleanup function
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
	
	console.warn(`[ChildProcessPolyfill] Tauri event listener not available for: ${event}`);
	return () => {};
}

// ============================================================================
// Mock Stream Implementation
// ============================================================================

/**
 * Create a mock stream for stdin/stdout/stderr
 */
function createMockStream(direction: "read" | "write"): Stream {
	const listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
	
	return {
		write(data: string | Buffer): boolean {
			console.log(`[ChildProcessPolyfill] Stream write (${direction}):`, data.toString().slice(0, 100));
			return true;
		},
		
		end(data?: string | Buffer): void {
			console.log(`[ChildProcessPolyfill] Stream end (${direction})`);
			this.emit("end");
		},
		
		on(event: string, listener: (...args: unknown[]) => void): void {
			if (!listeners.has(event)) {
				listeners.set(event, new Set());
			}
			listeners.get(event)!.add(listener);
		},
		
		removeAllListeners(event?: string): void {
			if (event) {
				listeners.delete(event);
			} else {
				listeners.clear();
			}
		},
		
		emit(event: string, ...args: unknown[]): void {
			const eventListeners = listeners.get(event);
			if (eventListeners) {
				eventListeners.forEach((listener) => {
					try {
						listener(...args);
					} catch (error) {
						console.error(`[ChildProcessPolyfill] Stream event error (${event}):`, error);
					}
				});
			}
		},
	};
}

// ============================================================================
// Child Process Implementation
// ============================================================================

/**
 * ChildProcess class implementing mock child process behavior
 */
class ChildProcess {
	// Process state
	pid: number = 0;
	killed: boolean = false;
	exitCode: number | null = null;
	signalCode: Signal | null = null;
	
	// Streams
	stdin: Stream;
	stdout: Stream;
	stderr: Stream;
	stdio: Stream[];
	
	// Event listeners
	private listeners: Map<ChildProcessEvent, Set<ChildProcessEventListener>> = new Map();
	
	// Process ID tracking
	private _sPid: string;
	
	constructor(spawnId: string) {
		this._sPid = spawnId;
		this.stdin = createMockStream("write");
		this.stdout = createMockStream("read");
		this.stderr = createMockStream("read");
		this.stdio = [this.stdin, this.stdout, this.stderr];
		
		this.setupEventListeners();
	}
	
	/**
	 * Set up Tauri event listeners for this process
	 */
	private setupEventListeners(): void {
		// Listen for spawn events from Tauri
		const unlistenSpawn = listenToTauri(`child_process:spawn:${this._sPid}`, (payload: unknown) => {
			console.log(`[ChildProcessPolyfill] Spawn event for ${this._sPid}:`, payload);
			this.emit("spawn");
		});
		
		// Listen for exit events from Tauri
		const unlistenExit = listenToTauri(`child_process:exit:${this._sPid}`, (payload: unknown) => {
			console.log(`[ChildProcessPolyfill] Exit event for ${this._sPid}:`, payload);
			const data = payload as { exit_code: number; signal: Signal | null };
			this.exitCode = data.exit_code;
			this.signalCode = data.signal;
			this.killed = true;
			this.emit("exit", this.exitCode, this.signalCode);
			this.emit("close", this.exitCode, this.signalCode);
		});
		
		// Listen for error events from Tauri
		const unlistenError = listenToTauri(`child_process:error:${this._sPid}`, (payload: unknown) => {
			console.error(`[ChildProcessPolyfill] Error event for ${this._sPid}:`, payload);
			this.emit("error", payload);
		});
		
		// Listen for stdout data
		const unlistenStdout = listenToTauri(`child_process:stdout:${this._sPid}`, (payload: unknown) => {
			const data = payload as { data: string | Buffer };
			this.stdout.emit("data", data.data instanceof Buffer ? data.data : Buffer.from(data.data));
		});
		
		// Listen for stderr data
		const unlistenStderr = listenToTauri(`child_process:stderr:${this._sPid}`, (payload: unknown) => {
			const data = payload as { data: string | Buffer };
			this.stderr.emit("data", data.data instanceof Buffer ? data.data : Buffer.from(data.data));
		});
		
		// Store cleanup functions
		this._unlistenFunctions = [
			unlistenSpawn,
			unlistenExit,
			unlistenError,
			unlistenStdout,
			unlistenStderr,
		];
	}
	
	private _unlistenFunctions: Array<() => void> = [];
	
	// ============================================================================
	// Event Methods
	// ============================================================================
	
	/**
	 * Add event listener
	 */
	on(event: ChildProcessEvent, listener: ChildProcessEventListener): this {
		console.log(`[ChildProcessPolyfill] on(${event}) for ${this._sPid}`);
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)!.add(listener);
		return this;
	}
	
	/**
	 * Add one-time event listener
	 */
	once(event: ChildProcessEvent, listener: ChildProcessEventListener): this {
		const wrappedListener: ChildProcessEventListener = (...args) => {
			this.removeListener(event, wrappedListener);
			listener(...args);
		};
		return this.on(event, wrappedListener);
	}
	
	/**
	 * Remove event listener
	 */
	removeListener(event: ChildProcessEvent, listener: ChildProcessEventListener): this {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.delete(listener);
			if (eventListeners.size === 0) {
				this.listeners.delete(event);
			}
		}
		return this;
	}
	
	/**
	 * Remove all listeners for an event
	 */
	removeAllListeners(event?: ChildProcessEvent): this {
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
	private emit(event: ChildProcessEvent, ...args: unknown[]): boolean {
		const listeners = this.listeners.get(event);
		if (!listeners || listeners.size === 0) {
			return false;
		}
		
		listeners.forEach((listener) => {
			try {
				listener(...args);
			} catch (error) {
				console.error(`[ChildProcessPolyfill] Error in ${event} listener:`, error);
			}
		});
		
		return true;
	}
	
	// ============================================================================
	// Process Control
	// ============================================================================
	
	/**
	 * Kill the process
	 */
	kill(signal: Signal = "SIGTERM"): boolean {
		console.log(`[ChildProcessPolyfill] Kill ${this._sPid} with signal: ${signal}`);
		
		if (this.killed) {
			return true;
		}
		
		this.signalCode = signal;
		
		// Send kill command to Tauri
		invokeTauri("child_process:kill", {
			spawn_id: this._sPid,
			signal,
		}).catch((error) => {
			console.error(`[ChildProcessPolyfill] Kill error for ${this._sPid}:`, error);
		});
		
		// Note: We don't immediately mark as killed; wait for exit event from Tauri
		return true;
	}
	
	/**
	 * Send a message to the process (IPC)
	 */
	send(message: unknown, sendHandle?: unknown, options?: { swallowErrors?: boolean }): boolean {
		console.log(`[ChildProcessPolyfill] Send message to ${this._sPid}:`, message);
		
		invokeTauri("child_process:send", {
			spawn_id: this._sPid,
			message,
		}).catch((error) => {
			console.error(`[ChildProcessPolyfill] Send error for ${this._sPid}:`, error);
		});
		
		return true;
	}
	
	/**
	 * Disconnect from the process
	 */
	disconnect(): void {
		console.log(`[ChildProcessPolyfill] Disconnect from ${this._sPid}`);
		this.removeAllListeners();
		this._unlistenFunctions.forEach((unlisten) => unlisten());
		this.stdin.end();
	}
	
	/**
	 * Ref the process (keep it alive)
	 */
	ref(): this {
		return this;
	}
	
	/**
	 * Unref the process (allow it to exit)
	 */
	unref(): this {
		return this;
	}
	
	/**
	 * Cleanup resources
	 */
	private cleanup(): void {
		this._unlistenFunctions.forEach((unlisten) => unlisten());
		this._unlistenFunctions = [];
	}
}

// ============================================================================
// Spawn Implementation
// ============================================================================

/**
 * Spawn a child process
 */
function spawn(command: string, args?: string[], options?: SpawnOptions): ChildProcess {
	console.log(`[ChildProcessPolyfill] spawn: ${command} ${args?.join(" ") ?? ""}`);

	// Generate unique spawn ID
	const spawnId = `spawn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

	const proc = new ChildProcess(spawnId);

	// Call Mountain to spawn the process
	invokeTauri<{
		pid: number;
		success: boolean;
		error?: string;
	}>("electron:spawn_child_process", {
		command,
		args: args ?? [],
		cwd: options?.cwd,
		env: options?.env,
		shell: options?.shell,
		// Note: stdio, detached, etc. are passed but may not be fully supported
	})
		.then((result) => {
			if (result.success) {
				proc.pid = result.pid;
				console.log(`[ChildProcessPolyfill] Process spawned with PID: ${proc.pid}`);
				proc.emit("spawn");
			} else {
				proc.emit("error", new Error(result.error ?? "Failed to spawn process"));
			}
		})
		.catch((error) => {
			console.error("[ChildProcessPolyfill] spawn error:", error);
			proc.emit("error", error);
		});

	return proc;
}

// ============================================================================
// Exec Implementation
// ============================================================================

/**
 * Execute a command and get output
 */
function exec(command: string, options?: ExecOptions, callback?: (error: Error | null, stdout: string, stderr: string) => void): ChildProcess {
	console.log(`[ChildProcessPolyfill] exec: ${command}`);

	// Generate unique exec ID
	const execId = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;

	const proc = new ChildProcess(execId);

	let stdout = "";
	let stderr = "";
	let error: Error | null = null;

	// Set up output capture
	proc.stdout.on("data", (data: Buffer) => {
		stdout += data.toString(options?.encoding ?? "utf8");
	});

	proc.stderr.on("data", (data: Buffer) => {
		stderr += data.toString(options?.encoding ?? "utf8");
	});

	proc.on("exit", (code: number | null) => {
		if (code !== 0) {
			error = new Error(`Command failed: ${command}\n${stderr}`);
			(error as Error & { code?: number; killed?: boolean }).code = code ?? undefined;
			(error as Error & { killed?: boolean }).killed = proc.killed;
		}

		if (callback) {
			callback(error, stdout, stderr);
		}
	});

	// Call Mountain to execute the command
	invokeTauri<{
		pid: number;
		success: boolean;
		error?: string;
	}>("electron:exec_command", {
		command,
		cwd: options?.cwd,
		env: options?.env,
		shell: options?.shell,
		timeout: options?.timeout,
	})
		.then((result) => {
			if (result.success) {
				proc.pid = result.pid;
			} else {
				error = new Error(result.error ?? "Failed to execute command");
				proc.emit("error", error);
			}
		})
		.catch((err) => {
			error = err;
			proc.emit("error", err);
		});

	return proc;
}

/**
 * Exec with Promise
 */
function execPromise(command: string, options?: ExecOptions): Promise<{ stdout: string; stderr: string }> {
	return new Promise((resolve, reject) => {
		const proc = exec(command, options, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve({ stdout, stderr });
			}
		});
	});
}

// ============================================================================
// Fork Implementation
// ============================================================================

/**
 * Fork a Node.js module as a child process
 * This is primarily used for extension hosts in VSCode
 */
function fork(modulePath: string, args?: string[], options?: ForkOptions): ChildProcess {
	console.log(`[ChildProcessPolyfill] fork: ${modulePath}`);

	// Generate unique fork ID
	const forkId = `fork_${Date.now()}_${Math.random().toString(36).substring(7)}`;

	const proc = new ChildProcess(forkId);

	// For extension hosting, we route to Cocoon
	const isExtensionHost = modulePath.includes("extensionHost") || modulePath.includes("process");

	if (isExtensionHost) {
		// Treat as extension host fork - route to Cocoon
		invokeTauri<{
			pid: number;
			success: boolean;
			error?: string;
		}>("electron:fork_extension_host", {
			module_path: modulePath,
			args: args ?? [],
			cwd: options?.cwd,
			env: options?.env,
			exec_path: options?.execPath,
			exec_argv: options?.execArgv,
			silent: options?.silent,
		})
			.then((result) => {
				if (result.success) {
					proc.pid = result.pid;
					console.log(`[ChildProcessPolyfill] Extension host forked with PID: ${proc.pid}`);
					proc.emit("spawn");
				} else {
					proc.emit("error", new Error(result.error ?? "Failed to fork extension host"));
				}
			})
			.catch((error) => {
				console.error("[ChildProcessPolyfill] fork error:", error);
				proc.emit("error", error);
			});
	} else {
		// Regular module fork - use spawn
		const forkedProc = spawn(
			options?.execPath ?? process.execPath,
			[modulePath, ...(args ?? [])],
			{
				cwd: options?.cwd,
				env: options?.env,
				silent: options?.silent ? "pipe" : "inherit",
			},
		);

		// Copy properties to our process
		proc.pid = forkedProc.pid;
	}

	return proc;
}

// ============================================================================
// Child Process Namespace
// ============================================================================

/**
 * Child process exports (mimicking Node.js child_process module)
 */
const childProcess = {
	spawn,
	exec,
	execSync: () => {
		throw new Error("childProcess.execSync() is not supported in browser/Tauri environment. Use async exec() instead.");
	},
	fork,
	execFile: exec, // execFile is similar to exec in this context
};

// ============================================================================
// Installation
// ============================================================================

/**
 * Install the child process polyfill
 */
export function installChildProcessPolyfill(): void {
	if (typeof window === "undefined") {
		return;
	}

	// Prevent double installation
	if ((window as any).__CHILD_PROCESS_POLYFILL_INSTALLED__) {
		console.log("[ChildProcessPolyfill] Already installed, skipping");
		return;
	}
	(window as any).__CHILD_PROCESS_POLYFILL_INSTALLED__ = true;

	console.log("[ChildProcessPolyfill] Installing Node.js child_process module polyfill...");

	// Attach module to global (for Node.js compatibility)
	(window as any).childProcess = childProcess;
	
	// Extend require shim
	if (typeof (window as any).require === "function") {
		// biome-ignore lint/complexity/noExplicitAny: Required for require shim
		const existingRequire = (window as any).require;
		(window as any).require = (id: string) => {
			if (id === "child_process") {
				return childProcess;
			}
			return existingRequire(id);
		};
	}

	// Also attach to window.vscode if available
	if (typeof (window as any).vscode !== "undefined") {
		(window as any).vscode.childProcess = childProcess;
	}

	console.log("[ChildProcessPolyfill] ✓ Node.js child_process module polyfill installed");
}

// Get process from global (for exec path, etc.)
const process = typeof window !== "undefined" && (window as any).process ? (window as any).process : { execPath: "/usr/local/bin/node" };

// ============================================================================
// Exports
// ============================================================================

export default {
	install: installChildProcessPolyfill,
	module: childProcess,
	
	// Individual exports for convenience
	spawn,
	exec,
	execPromise,
	fork,
	
	// Types
	ChildProcess,
};

// Auto-install on import
if (typeof window !== "undefined") {
	installChildProcessPolyfill();
}
