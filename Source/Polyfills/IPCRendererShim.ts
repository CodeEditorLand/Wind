/**
 * @module IPCRendererShim
 *
 * @description
 * Comprehensive polyfill for Electron's ipcRenderer API.
 * Maps Electron IPC channels to Tauri commands for full compatibility.
 *
 * @feature_set
 * - send(channel, ...args) - Send message to main process
 * - sendSync(channel, ...args) - Synchronous send (polyfilled as async with warning)
 * - invoke(channel, ...args) - Invoke main and get response
 * - on(channel, listener) - Register listener
 * - once(channel, listener) - One-time listener
 * - removeListener(channel, listener) - Remove listener
 * - removeAllListeners(channel) - Remove all listeners for channel
 * - sendTo(channel, args, callback) - Client-side request-reply pattern
 * - onReply(channel, handler) - Register reply handler
 *
 * @ipc_channel_mapping
 * - logger:* → Mountain logging service
 * - policy:* → Mountain policy service
 * - sign:* → Mountain signing service
 * - userDataProfiles:* → Mountain user data service
 * - localFileSystem:* → Mountain file system service
 * - crashReporter:* → Mountain crash reporting
 * - encryption:* → Mountain encryption service
 * - machineId:* → Mountain machine ID service
 *
 * @phase 2 of Approach A3 implementation
 */

// ============================================================================
// Imports
// ============================================================================

import type {
	IpcRenderer,
	IpcRendererEvent,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";

// ============================================================================
// Types
// ============================================================================

/**
 * Channel mapping from Electron to Tauri commands
 */
interface IPCChannelMapping {
	electronPattern: RegExp;
	tauriCommand: string;
	transform?: (args: unknown[]) => Record<string, unknown>;
}

/**
 * Reply handler for client-side request-reply pattern
 */
type ReplyHandler = (response: unknown) => void;

/**
 * SendTo request with callback
 */
interface SendToRequest {
	channel: string;
	args: unknown[];
	callback: ReplyHandler;
	timestamp: number;
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
		const tauri =
			(
				window as unknown as {
					__TAURI__?: { invoke: typeof invokeTauri };
				}
			).__TAURI__ ??
			(window as unknown as { TAURI?: { invoke: typeof invokeTauri } })
				.TAURI;
		if (typeof tauri?.invoke === "function") {
			return await tauri.invoke<T>(command, args);
		}

		throw new Error(`Tauri invoke not available for command: ${command}`);
	} catch (error: unknown) {
		console.error(
			`[IPCRendererShim] Tauri invoke failed for ${command}:`,
			error,
		);
		throw error;
	}
}

/**
 * Send Tauri command (no response)
 */
function sendTauri(command: string, args: Record<string, unknown> = {}): void {
	try {
		const tauri =
			(
				window as unknown as {
					__TAURI__?: { invoke: typeof invokeTauri };
				}
			).__TAURI__ ??
			(window as unknown as { TAURI?: { invoke: typeof invokeTauri } })
				.TAURI;
		if (typeof tauri?.invoke === "function") {
			tauri.invoke(command, args).catch((error: Error) => {
				console.warn(
					`[IPCRendererShim] Tauri send failed (no response expected): ${command}`,
					error,
				);
			});
		} else {
			console.warn(
				`[IPCRendererShim] Tauri not available for: ${command}`,
			);
		}
	} catch (error) {
		console.warn(
			`[IPCRendererShim] Tauri send error (no response expected): ${command}`,
			error,
		);
	}
}

// ============================================================================
// IPC Channel Mappings
// ============================================================================

/**
 * Map Electron IPC channels to Tauri commands
 */
const IPC_CHANNEL_MAPPINGS: IPCChannelMapping[] = [
	// Logger service
	{
		electronPattern: /^logger:(log|warn|error|info|debug|trace|critical)$/,
		tauriCommand: "logger:log",
		transform: (_args) => ({
			level: _args[0] as string,
			message: _args[1] as string,
			context: _args[2] as Record<string, unknown>,
		}),
	},
	// Policy service
	{
		electronPattern: /^policy:(get|set|validate|enforce|check)$/,
		tauriCommand: "policy:handle",
		transform: (_args) => ({
			action: _args[0] as string,
			data: _args[1] as Record<string, unknown>,
		}),
	},
	// Signing service
	{
		electronPattern: /^sign:(sign|verify|generate|validate)$/,
		tauriCommand: "sign:handle",
		transform: (_args) => ({
			action: _args[0] as string,
			data: _args[1] as string,
			options: _args[2] as Record<string, unknown>,
		}),
	},
	// User data profiles service
	{
		electronPattern: /^userDataProfiles:(create|delete|update|get|list)$/,
		tauriCommand: "user_data:handle_profile",
		transform: (_args) => ({
			action: _args[0] as string,
			profileId: _args[1] as string,
			data: _args[2] as Record<string, unknown>,
		}),
	},
	// Local file system service
	{
		electronPattern:
			/^localFileSystem:(read|write|delete|exists|stat|readdir)$/,
		tauriCommand: "file:handle",
		transform: (_args) => ({
			action: _args[0] as string,
			path: _args[1] as string,
			data: _args[2] as string | Buffer,
		}),
	},
];

/**
 * Find matching Tauri command for an Electron IPC channel
 */
function mapElectronChannelToTauri(
	channel: string,
): { command: string; args: Record<string, unknown> } | null {
	for (const mapping of IPC_CHANNEL_MAPPINGS) {
		if (mapping.electronPattern.test(channel)) {
			const args = mapping.transform?.([]) ?? {};
			return { command: mapping.tauriCommand, args };
		}
	}
	return null;
}

/**
 * Extract channel-specific arguments for transformation
 */
function transformChannelArgs(
	channel: string,
	args: unknown[],
): Record<string, unknown> {
	for (const mapping of IPC_CHANNEL_MAPPINGS) {
		if (mapping.electronPattern.test(channel) && mapping.transform) {
			return mapping.transform(args);
		}
	}
	// Return args as-is if no mapping found
	return { args };
}

// ============================================================================
// IPC Renderer Implementation
// ============================================================================

// ============================================================================
// VS Code Binary IPC Protocol — Loopback Responder
// ============================================================================

/**
 * Minimal re-implementation of VS Code's serialize/deserialize for IPC messages.
 * Speaks the same binary protocol as ipc.js ChannelServer/ChannelClient.
 *
 * DataType enum: Undefined=0, String=1, Buffer=2, VSBuffer=3, Array=4, Object=5, Int=6
 * RequestType: Promise=100, PromiseCancel=101, EventListen=102, EventDispose=103
 * ResponseType: Initialize=200, PromiseSuccess=201, PromiseError=202, PromiseErrorObj=203, EventFire=204
 */

function SerializeIPC(Data: unknown): Uint8Array {
	const Parts: Uint8Array[] = [];
	function Write(Value: unknown): void {
		if (Value === undefined || Value === null) {
			Parts.push(new Uint8Array([0])); // Undefined
		} else if (typeof Value === "string") {
			const Encoded = new TextEncoder().encode(Value);
			Parts.push(new Uint8Array([1])); // String
			WriteVQL(Encoded.length);
			Parts.push(Encoded);
		} else if (Array.isArray(Value)) {
			Parts.push(new Uint8Array([4])); // Array
			WriteVQL(Value.length);
			for (const Item of Value) Write(Item);
		} else if (typeof Value === "number" && (Value | 0) === Value) {
			Parts.push(new Uint8Array([6])); // Int
			WriteVQL(Value);
		} else {
			const Encoded = new TextEncoder().encode(JSON.stringify(Value));
			Parts.push(new Uint8Array([5])); // Object
			WriteVQL(Encoded.length);
			Parts.push(Encoded);
		}
	}
	function WriteVQL(Value: number): void {
		const Bytes: number[] = [];
		let V = Value >>> 0;
		while (V > 0x7f) {
			Bytes.push((V & 0x7f) | 0x80);
			V >>>= 7;
		}
		Bytes.push(V & 0x7f);
		Parts.push(new Uint8Array(Bytes));
	}
	Write(Data);
	let Total = 0;
	for (const P of Parts) Total += P.length;
	const Result = new Uint8Array(Total);
	let Offset = 0;
	for (const P of Parts) {
		Result.set(P, Offset);
		Offset += P.length;
	}
	return Result;
}

function DeserializeIPC(Buffer: ArrayBuffer): unknown {
	const View = new Uint8Array(Buffer);
	let Pos = 0;
	function ReadVQL(): number {
		let Value = 0;
		for (let N = 0; ; N += 7) {
			const Byte = View[Pos++];
			Value |= (Byte & 0x7f) << N;
			if (!(Byte & 0x80)) return Value;
		}
	}
	function Read(): unknown {
		const Type = View[Pos++];
		switch (Type) {
			case 0:
				return undefined;
			case 1: {
				const Len = ReadVQL();
				const Str = new TextDecoder().decode(
					View.slice(Pos, Pos + Len),
				);
				Pos += Len;
				return Str;
			}
			case 2:
			case 3: {
				const Len = ReadVQL();
				const Buf = View.slice(Pos, Pos + Len);
				Pos += Len;
				return Buf;
			}
			case 4: {
				const Len = ReadVQL();
				const Arr: unknown[] = [];
				for (let I = 0; I < Len; I++) Arr.push(Read());
				return Arr;
			}
			case 5: {
				const Len = ReadVQL();
				const Str = new TextDecoder().decode(
					View.slice(Pos, Pos + Len),
				);
				Pos += Len;
				return JSON.parse(Str);
			}
			case 6:
				return ReadVQL();
		}
	}
	return Read();
}

/** Build a complete IPC message: serialize(header) + serialize(body) */
function BuildIPCMessage(Header: unknown, Body: unknown): Uint8Array {
	const H = SerializeIPC(Header);
	const B = SerializeIPC(Body);
	const Result = new Uint8Array(H.length + B.length);
	Result.set(H, 0);
	Result.set(B, H.length);
	return Result;
}

/** Parse an incoming IPC message into header + body */
function ParseIPCMessage(Buffer: ArrayBuffer): {
	Header: unknown;
	Body: unknown;
} {
	const View = new Uint8Array(Buffer);
	let Pos = 0;
	function ReadVQL(): number {
		let Value = 0;
		for (let N = 0; ; N += 7) {
			const Byte = View[Pos++];
			Value |= (Byte & 0x7f) << N;
			if (!(Byte & 0x80)) return Value;
		}
	}
	function Read(): unknown {
		const Type = View[Pos++];
		switch (Type) {
			case 0:
				return undefined;
			case 1: {
				const Len = ReadVQL();
				const Str = new TextDecoder().decode(
					View.slice(Pos, Pos + Len),
				);
				Pos += Len;
				return Str;
			}
			case 2:
			case 3: {
				const Len = ReadVQL();
				Pos += Len;
				return View.slice(Pos - Len, Pos);
			}
			case 4: {
				const Len = ReadVQL();
				const Arr: unknown[] = [];
				for (let I = 0; I < Len; I++) Arr.push(Read());
				return Arr;
			}
			case 5: {
				const Len = ReadVQL();
				const Str = new TextDecoder().decode(
					View.slice(Pos, Pos + Len),
				);
				Pos += Len;
				return JSON.parse(Str);
			}
			case 6:
				return ReadVQL();
		}
	}
	const Header = Read();
	const Body = Read();
	return { Header, Body };
}

// ============================================================================
// IPC Renderer Implementation
// ============================================================================

/**
 * IPC Renderer class that implements Electron's ipcRenderer API
 * with a built-in binary IPC loopback that speaks VS Code's ChannelClient protocol.
 */
class IPCRendererImpl implements IpcRenderer {
	// Track event listeners by channel
	listeners = new Map<
		string,
		Set<(event: IpcRendererEvent, ...args: unknown[]) => void>
	>();

	// Track reply handlers
	replyHandlers = new Map<number, SendToRequest>();
	replyCounter = 0;

	// Track once listeners
	onceListeners = new Map<
		string,
		Set<WeakRef<(event: IpcRendererEvent, ...args: unknown[]) => void>>
	>();

	/**
	 * Emit a vscode:message event to registered listeners (loopback)
	 */
	private emitMessage(Data: Uint8Array | ArrayBuffer): void {
		const Event: IpcRendererEvent = {
			sender: {} as IpcRendererEvent["sender"],
			senderId: 0,
			senderIsMainFrame: true,
			ports: [],
		};
		const Listeners = this.listeners.get("vscode:message");
		if (Listeners) {
			for (const Listener of Listeners) {
				try {
					Listener(Event, Data);
				} catch (Error) {
					console.error(
						"[IPCRendererShim] Error in vscode:message listener:",
						Error,
					);
				}
			}
		}
	}

	/**
	 * Handle the VS Code binary IPC protocol (loopback responder).
	 * Parses incoming binary requests and sends back stub responses.
	 */
	private handleBinaryIPC(Buffer: ArrayBuffer): void {
		try {
			const { Header, Body } = ParseIPCMessage(Buffer);
			const HeaderArr = Header as number[];
			if (!Array.isArray(HeaderArr)) return;

			const Type = HeaderArr[0];

			// RequestType.Promise = 100
			if (Type === 100) {
				const RequestId = HeaderArr[1] as number;
				const ChannelName = HeaderArr[2] as string;
				const MethodName = HeaderArr[3] as string;

				console.log(
					`[IPCRendererShim] IPC request: ${ChannelName}.${MethodName} (id=${RequestId})`,
				);

				const StubResponse = this.getStubResponse(
					ChannelName,
					MethodName,
					Body,
				);

				// Check for error sentinel — send PromiseError (202) instead
				if (
					typeof StubResponse === "string" &&
					StubResponse.startsWith("__IPC_ERROR__")
				) {
					const ErrorMessage = StubResponse.slice(13);
					// PromiseError format: [202, requestId], errorMessage
					const Response = BuildIPCMessage(
						[202, RequestId],
						ErrorMessage,
					);
					setTimeout(() => this.emitMessage(Response), 0);
				} else {
					// PromiseSuccess (201) + stub data
					const Response = BuildIPCMessage(
						[201, RequestId],
						StubResponse,
					);
					setTimeout(() => this.emitMessage(Response), 0);
				}
			}
			// RequestType.EventListen = 102
			else if (Type === 102) {
				const RequestId = HeaderArr[1] as number;
				const ChannelName = HeaderArr[2] as string;
				const EventName = HeaderArr[3] as string;
				console.log(
					`[IPCRendererShim] IPC event subscribe: ${ChannelName}.${EventName} (id=${RequestId})`,
				);
				// Event subscriptions don't need immediate response.
				// The server fires EventFire (204) when events occur.
			}
		} catch (Error) {
			console.warn(
				"[IPCRendererShim] Failed to parse IPC message:",
				Error,
			);
		}
	}

	/**
	 * Get a stub response for a channel method call.
	 * These stubs allow the workbench to initialize without a real main process.
	 */
	private getStubResponse(
		Channel: string,
		Method: string,
		_Args: unknown,
	): unknown {
		switch (Channel) {
			case "logger":
				// LoggerChannelClient: createLogger, log, setVisibility, etc.
				return undefined;
			case "policy":
				// PolicyChannelClient: listen, serialize
				if (Method === "serialize") return {};
				return undefined;
			case "sign":
				// SignService: sign, createNewMessage, validate
				return "";
			case "userDataProfiles":
				// UserDataProfilesService: various profile ops
				return undefined;
			case "keyboardLayout":
				// NativeKeyboardLayoutService: getKeyboardLayoutData
				if (Method === "getKeyboardLayoutData") {
					return {
						keyboardLayoutInfo: {
							model: "pc105",
							layout: "us",
							variant: "",
							options: "",
							rules: "",
						},
						keyboardMapping: {},
					};
				}
				return undefined;
			case "storage":
				// RemoteStorageService → ApplicationStorageDatabaseClient
				// Methods: getItems, updateItems, optimize, close
				if (Method === "getItems") return [];
				if (Method === "updateItems") return undefined;
				if (Method === "optimize") return undefined;
				if (Method === "close") return undefined;
				return undefined;
			case "configuration":
				// ConfigurationService: getValue, updateValue
				if (Method === "getValue") return {};
				if (Method === "updateValue") return undefined;
				return undefined;
			case "sharedProcess":
				// SharedProcessService: when, dispose
				return undefined;
			case "localFilesystem":
			case "localFileSystem":
				// DiskFileSystemProviderClient (channel: localFilesystem)
				// Return FileNotFound errors for stat/readFile so the workbench
				// gracefully handles missing files instead of hanging.
				// The error format matches FileSystemProviderErrorCode.FileNotFound.
				return "__IPC_ERROR__FileNotFound";

			default:
				console.log(
					`[IPCRendererShim] Stub response for unknown channel: ${Channel}.${Method}`,
				);
				return undefined;
		}
	}

	/**
	 * Send message to main process
	 */
	send(channel: string, ...args: unknown[]): void {
		console.log(`[IPCRendererShim] send: ${channel}`, args);

		// Handle VS Code binary IPC protocol
		if (channel === "vscode:hello") {
			// The ChannelClient waits for Initialize (type 200) response.
			// Send it asynchronously so the listener is registered first.
			console.log(
				"[IPCRendererShim] vscode:hello received, sending Initialize response",
			);
			setTimeout(() => {
				const InitMessage = BuildIPCMessage([200], undefined);
				this.emitMessage(InitMessage);
			}, 0);
			return;
		}

		if (channel === "vscode:message") {
			// Binary IPC message from workbench → parse and respond
			const Buffer = args[0];
			if (Buffer instanceof ArrayBuffer || ArrayBuffer.isView(Buffer)) {
				const AB =
					Buffer instanceof ArrayBuffer
						? Buffer
						: (Buffer as Uint8Array).buffer;
				this.handleBinaryIPC(AB);
			}
			return;
		}

		// Map Electron channel to Tauri command
		const mapping = mapElectronChannelToTauri(channel);

		if (mapping) {
			// Use mapped Tauri command with transformed args
			const tauriArgs = transformChannelArgs(channel, args);
			sendTauri(mapping.command, tauriArgs);
		} else {
			// Generic IPC send through Tauri
			sendTauri("ipc:send", {
				channel,
				args,
			});
		}
	}

	/**
	 * Synchronous send - polyfilled as async with warning
	 */
	sendSync(_channel: string, ..._args: unknown[]): unknown {
		console.warn(
			`[IPCRendererShim] ⚠️ sendSync is not supported in Tauri. Use invoke() instead. Returning undefined.`,
		);
		return undefined;
	}

	/**
	 * Invoke main process and get response
	 */
	async invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
		console.log(`[IPCRendererShim] invoke: ${channel}`, args);

		// Map Electron channel to Tauri command
		const mapping = mapElectronChannelToTauri(channel);

		if (mapping) {
			const tauriArgs = transformChannelArgs(channel, args);
			return await invokeTauri<T>(mapping.command, tauriArgs);
		}

		// Generic IPC invoke through Tauri
		return await invokeTauri<T>("ipc:invoke", {
			channel,
			args,
		});
	}

	/**
	 * Register event listener
	 */
	on(
		channel: string,
		listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
	): this {
		console.log(`[IPCRendererShim] on: ${channel}`);

		if (!this.listeners.has(channel)) {
			this.listeners.set(channel, new Set());
		}
		this.listeners.get(channel)!.add(listener);

		// Also register with Tauri for main→renderer communication
		this.registerTauriListener(channel, listener);

		return this;
	}

	/**
	 * Register one-time event listener
	 */
	once(
		channel: string,
		listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
	): this {
		console.log(`[IPCRendererShim] once: ${channel}`);

		if (!this.onceListeners.has(channel)) {
			this.onceListeners.set(channel, new Set());
		}
		this.onceListeners.get(channel)!.add(new WeakRef(listener));

		// Create wrapper that removes listener after first call
		const wrappedListener = (
			_event: IpcRendererEvent,
			...args: unknown[]
		) => {
			listener(_event, ...args);
			this.removeListener(channel, wrappedListener);
		};

		this.on(channel, wrappedListener);

		return this;
	}

	/**
	 * Remove specific listener
	 */
	removeListener(
		channel: string,
		listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
	): this {
		console.log(`[IPCRendererShim] removeListener: ${channel}`);

		const channelListeners = this.listeners.get(channel);
		if (channelListeners) {
			channelListeners.delete(listener);
			if (channelListeners.size === 0) {
				this.listeners.delete(channel);
			}
		}

		return this;
	}

	/**
	 * Remove all listeners for a channel
	 */
	removeAllListeners(channel?: string): this {
		console.log(
			`[IPCRendererShim] removeAllListeners: ${channel ?? "all"}`,
		);

		if (channel) {
			this.listeners.delete(channel);
		} else {
			this.listeners.clear();
		}

		return this;
	}

	/**
	 * Client-side request-reply pattern (sendTo + onReply)
	 */
	sendTo(channel: string, args: unknown[], callback: ReplyHandler): void {
		console.log(`[IPCRendererShim] sendTo: ${channel}`);

		const requestId = ++this.replyCounter;
		const request: SendToRequest = {
			channel,
			args,
			callback,
			timestamp: Date.now(),
		};

		this.replyHandlers.set(requestId, request);

		this.invoke(channel, ...args)
			.then((response) => {
				const handler = this.replyHandlers.get(requestId);
				if (handler) {
					handler.callback(response);
					this.replyHandlers.delete(requestId);
				}
			})
			.catch((error) => {
				console.error(
					`[IPCRendererShim] sendTo error: ${channel}`,
					error,
				);
				const handler = this.replyHandlers.get(requestId);
				if (handler) {
					handler.callback({ error: error.message });
					this.replyHandlers.delete(requestId);
				}
			});
	}

	/**
	 * Register reply handler for sendTo pattern
	 */
	onReply(channel: string, handler: ReplyHandler): void {
		console.log(`[IPCRendererShim] onReply: ${channel}`);

		this.on(channel, (_event, ...args) => {
			handler(args[0]);
		});
	}

	/**
	 * Helper method to register listener with Tauri
	 */
	private registerTauriListener(
		_channel: string,
		_listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
	): void {
		// Note: Full event listener registration requires Tauri event system
		// This is a placeholder - actual implementation depends on Tauri setup
		console.log(
			`[IPCRendererShim] Registering Tauri listener for: ${_channel}`,
		);
	}

	/**
	 * Cleanup method to remove all listeners
	 */
	cleanup(): void {
		console.log("[IPCRendererShim] Cleaning up IPC listeners");
		this.listeners.clear();
		this.onceListeners.clear();
		this.replyHandlers.clear();
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let ipcRendererInstance: IPCRendererImpl | null = null;

/**
 * Get or create the IPC renderer singleton
 */
export function getIPCRenderer(): IpcRenderer {
	if (!ipcRendererInstance) {
		ipcRendererInstance = new IPCRendererImpl();
		console.log("[IPCRendererShim] IPCRenderer instance created");
	}
	return ipcRendererInstance;
}

// ============================================================================
// Installation
// ============================================================================

/**
 * Install the IPC renderer shim into window.vscode.ipcRenderer
 */
export function installIPCRendererShim(): void {
	if (typeof window === "undefined") {
		return;
	}

	// Prevent double installation
	if (
		(window as unknown as { __IPC_RENDERER_SHIM_INSTALLED__?: boolean })
			.__IPC_RENDERER_SHIM_INSTALLED__
	) {
		console.log("[IPCRendererShim] Already installed, skipping");
		return;
	}
	(
		window as unknown as { __IPC_RENDERER_SHIM_INSTALLED__: boolean }
	).__IPC_RENDERER_SHIM_INSTALLED__ = true;

	console.log(
		"[IPCRendererShim] Installing Electron IPC renderer polyfill...",
	);

	// Create IPC renderer instance
	const ipcRenderer = getIPCRenderer();

	// Attach to window.vscode if available
	if (
		typeof (window as unknown as { vscode?: Record<string, unknown> })
			.vscode !== "undefined"
	) {
		(
			window as unknown as { vscode?: { ipcRenderer?: IpcRenderer } }
		).vscode!.ipcRenderer = ipcRenderer;
		console.log(
			"[IPCRendererShim] ✓ IPCRenderer attached to window.vscode",
		);
	}

	// Also make available globally for easier access
	(window as unknown as { __IPC_RENDERER__?: IpcRenderer }).__IPC_RENDERER__ =
		ipcRenderer;

	console.log("[IPCRendererShim] ✓ Electron IPC renderer polyfill installed");
}

// ============================================================================
// Exports
// ============================================================================

export { IPCRendererImpl as IPCRendererClass };

export default {
	install: installIPCRendererShim,
	get: getIPCRenderer,
};

// Auto-install on import
if (typeof window !== "undefined") {
	installIPCRendererShim();
}
