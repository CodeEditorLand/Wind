// ============================================================================
// Element: Wind - 50-Level Deep Analysis
// ============================================================================
//
// Overview
// --------
// Wind is the TypeScript/Effect-TS based UI service layer.
//
// Level 1-10: Basic Structure
// ---------------------------
// | Level | Task                           | Status |
// |-------|--------------------------------|--------|
// | 1     | Verify package.json exists     | ✅     |
// | 2     | Check Source/Effect/ structure | ✅     |
// | 3     | Identify main services         | ✅     |
// | 4     | Check for TypeScript config    | ✅     |
// | 5     | Check Configuration/ directory | ✅     |
// | 6     | Check .turbo directory         | ✅     |
// | 7     | Identify Dependencies          | ✅     |
// | 8     | Check for tests/               | ⬜     |
// | 9     | Verify .github/workflows       | ⬜     |
// | 10    | Check Preload.ts               | ✅     |
//
// Level 11-20: Service Analysis
// -----------------------------
// | Level | Task                          | Status |
// |-------|-------------------------------|--------|
// | 11    | Analyze Clipboard service     | ⬜     |
// | 12    | Analyze Configuration service | ⬜     |
// | 13    | Analyze Environment service   | ⬜     |
// | 14    | Analyze Health service        | ⬜     |
// | 15    | Analyze IPC service           | ⬜     |
// | 16    | Analyze Mountain service      | ⬜     |
// | 17    | Analyze MountainSync service  | ⬜     |
// | 18    | Check FileSystem services     | ⬜     |
// | 19    | Check Function services       | ⬜     |
// | 20    | Check Workbench services      | ⬜     |
//
// Level 21-30: Service Pattern Analysis
// -------------------------------------
// | Level | Task                              | Status  |
// |-------|-----------------------------------|---------|
// | 21    | Verify Define/Implement/Problem   | ⬜     |
// | 22    | Check for old Interface/Live      | ⚠️ Mixed |
// | 23    | Check Configuration service       | ✅     |
// | 24    | Check Clipboard service           | ⚠️     |
// | 25    | Verify Layer composition          | ⬜     |
// | 26    | Verify Effect.Service patterns    | ⬜     |
// | 27    | Check IntegrationService          | ⬜     |
// | 28    | Verify TauriFileService           | ⬜     |
// | 29    | Check mock implementations        | ⬜     |
// | 30    | Verify test patterns              | ⬜     |
//
// Level 31-40: Code Quality Checks (TODOs: 4)
// --------------------------------------------
// | Level | Task                        | Status  |
// |-------|-----------------------------|---------|
// | 31    | Check for unused imports    | ⬜     |
// | 32    | Check for dead code         | ⬜     |
// | 33    | Check TODO comments (4)     | 🟢 Low |
// | 34    | Verify naming conventions   | ⬜     |
// | 35    | Check error handling        | ⬜     |
// | 36    | Verify logging patterns     | ⬜     |
// | 37    | Check for console.log       | ⬜     |
// | 38    | Verify async patterns       | ⬜     |
// | 39    | Check memory leaks          | ⬜     |
// | 40    | Verify test coverage        | ⬜     |
//
// Level 41-50: Convention Verification
// -------------------------------------
// | Level | Task                        | Status    |
// |-------|-----------------------------|-----------|
// | 41    | Verify PascalCase           | ✅ Verified |
// | 42    | Check .ts file naming       | ⬜         |
// | 43    | Check service directory structure | ⬜   |
// | 44    | Verify Problem.ts usage     | ⬜         |
// | 45    | Check Error.ts usage        | ⬜         |
// | 46    | Verify Interface.ts vs Define.ts | ⚠️    |
// | 47    | Check Live.ts vs Implement.ts | ⚠️       |
// | 48    | Verify Tag.ts usage         | ⬜         |
// | 49    | Final Wind-specific audit   | ⬜         |
// | 50    | Complete Wind analysis      | ⬜         |
//
// Pattern Migration Status
// ------------------------
// - **New Pattern (Define/Implement/Problem)**: Configuration service ✅
// - **Old Pattern (Interface/Live/Mock/Tag/Type)**: Clipboard, others ⚠️
// - **Action**: Need to migrate remaining services
//
// Summary for Wind
// ----------------
// - **Type**: TypeScript/Effect-TS
// - **TODOs**: 4 found 🟢
// - **Key Change**: Service architecture pattern (560016c)
// - **Action Needed**: Migrate remaining services to Define/Implement/Problem
//
// Last Updated: 2026-03-03
// ============================================================================

/**
 * @module Preload
 * @description
 * Atomic preload script - exposes window.vscode with minimal surface area.
 * All heavy lifting moved to Effect services.
 */

import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";

// ============================================================================
// Atom: Cleanup registry for event listeners
// ============================================================================

const CleanupMap = new Map<string, () => void>();

// ============================================================================
// Atom: Tauri Availability Check
// ============================================================================

const IsTauri =
	typeof window !== "undefined" && (window as any).__TAURI__ !== undefined;

// ============================================================================
// Atom: IPC Renderer (minimal wrapper)
// ============================================================================

const ipcRenderer = {
	send: (channel: string, ...args: unknown[]) => {
		emit(channel, args.length === 1 ? args[0] : args);
	},

	invoke: async (channel: string, ...args: unknown[]): Promise<unknown> => {
		return tauriInvoke(
			channel,
			args.length === 0 ? undefined : args.length === 1 ? args[0] : args,
		) as Promise<unknown>;
	},

	on: (
		channel: string,

		listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		listen(channel, (event) => {
			listener(event, event.payload);
		}).then((unlisten) => {
			const Cleanup = () => unlisten();
			CleanupMap.set(channel, Cleanup);
		});
	},

	once: (
		channel: string,

		listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		const wrappedListener = (event: unknown) => {
			listener(event, (event as any).payload || event);
		};

		listen(channel, wrappedListener as any).then((Unlisten) => {
			// Remove after first call
			setTimeout(() => Unlisten(), 0);
		});
	},

	removeListener: (
		channel: string,

		_listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		const Cleanup = CleanupMap.get(channel);

		if (Cleanup) {
			Cleanup();

			CleanupMap.delete(channel);
		}
	},

	removeAllListeners: (channel: string) => {
		const Cleanup = CleanupMap.get(channel);

		if (Cleanup) {
			Cleanup();

			CleanupMap.delete(channel);
		}
	},
};

// ============================================================================
// Atom: MessagePort (placeholder - FUTURE: implement with MessageChannel)
// ============================================================================

const ipcMessagePort = {
	acquire: (responseChannel: string, nonce: string) => {
		// Create an in-memory MessageChannel.
		// port2 is posted to the window so acquirePort() (ipc.mp.ts) picks it up
		// via its window 'message' listener (filters e.data === nonce && e.ports[0]).
		// port1 implements a minimal extension host handshake so VS Code
		// does not hang for 60 s waiting for Ready / Initialized.
		const { port1, port2 } = new MessageChannel();

		// acquirePort() filters: e.data === nonce && e.source === window
		window.postMessage(nonce, "*", [port2]);

		port1.start();

		let HandshakeComplete = false;

		let MessageCount = 0;

		const ForwardToMountain = (Data: ArrayBuffer | Uint8Array) => {
			// Forward binary extension host protocol messages to Mountain
			// for relay to Cocoon via gRPC. Mountain will handle decoding.
			const Invoke =
				(window as any).__TAURI__?.core?.invoke ??
				(window as any).__TAURI__?.invoke;

			if (typeof Invoke === "function") {
				const Bytes =
					Data instanceof Uint8Array
						? Array.from(Data)
						: Array.from(new Uint8Array(Data));

				Invoke("MountainIPCInvoke", {
					method: "cocoon:extensionHostMessage",
					params: [{ data: Bytes, responseChannel }],
				}).catch(() => {});
			}
		};

		port1.onmessage = (Event: MessageEvent) => {
			const Data = Event.data;

			const Length =
				Data instanceof ArrayBuffer
					? Data.byteLength
					: Data instanceof Uint8Array
						? Data.byteLength
						: typeof Data === "object" && Data?.byteLength
							? Data.byteLength
							: 0;

			if (!HandshakeComplete) {
				// The first large message from VS Code is the init data
				// (JSON-encoded IExtensionHostInitData wrapped in VSBuffer).
				// Any message with byteLength > 1 is init data; single-byte
				// messages are control (Ready=2, Initialized=1, Terminate=3).
				if (Length > 1) {
					HandshakeComplete = true;

					try {
						performance.mark(
							"land:exthost:handshake:init-data-received",

							{
								detail: { bytes: Length },
							},
						);
					} catch {}

					// Log init data summary for debugging
					try {
						const Bytes =
							Data instanceof Uint8Array
								? Data
								: new Uint8Array(Data);

						const Text = new TextDecoder().decode(
							Bytes.slice(0, 500),
						);

						_PreloadShimLog(
							`[Extension Host] Init data received: ${Length} bytes, preview: ${Text.slice(0, 200)}`,
						);
					} catch {}

					// Forward init data to Mountain for Cocoon
					ForwardToMountain(
						Data instanceof Uint8Array
							? Data
							: new Uint8Array(Data),
					);

					// MessageType.Initialized → byte 1
					port1.postMessage(new Uint8Array([1]));

					try {
						performance.mark(
							"land:exthost:handshake:initialized-sent",
						);
					} catch {}

					_PreloadShimLog(
						"[Extension Host] Handshake complete - Initialized sent",
					);
				} else {
					_PreloadShimLog(
						`[Extension Host] Handshake: ignoring control byte ${Length > 0 ? new Uint8Array(Data instanceof ArrayBuffer ? Data : Data)[0] : "empty"}`,
					);
				}

				return;
			}

			// Post-handshake: forward extension host protocol messages (RPC)
			MessageCount++;

			try {
				performance.mark(`land:exthost:rpc:${MessageCount}`, {
					detail: { bytes: Length },
				});
			} catch {}

			if (MessageCount <= 5) {
				// Log first few RPC messages for debugging
				try {
					const Bytes =
						Data instanceof Uint8Array
							? Data
							: new Uint8Array(Data);

					const Preview = new TextDecoder().decode(
						Bytes.slice(0, 200),
					);

					_PreloadShimLog(
						`[Extension Host] RPC #${MessageCount}: ${Length} bytes, preview: ${Preview.slice(0, 150)}`,
					);
				} catch {}
			}

			if (Length > 0) {
				ForwardToMountain(
					Data instanceof Uint8Array ? Data : new Uint8Array(Data),
				);
			}
		};

		// Listen for Cocoon → workbench messages via Tauri events
		const TauriListen = (window as any).__TAURI__?.event?.listen;

		if (typeof TauriListen === "function") {
			TauriListen(
				"cocoon:extensionHostReply",

				(Event: { payload: { data: number[] } }) => {
					if (Event?.payload?.data) {
						port1.postMessage(new Uint8Array(Event.payload.data));
					}
				},
			).catch(() => {});
		}

		// Send Ready after a tick so VS Code's onMessage listener is registered.
		// MessageType.Ready → byte 2
		setTimeout(() => {
			port1.postMessage(new Uint8Array([2]));
			try {
				performance.mark("land:exthost:handshake:ready-sent");
			} catch {}
			_PreloadShimLog(
				"[Extension Host] Ready sent on MessagePort, waiting for init data...",
			);
		}, 50);
	},
};

// ============================================================================
// Atom: WebFrame
// ============================================================================

const webFrame = {
	setZoomLevel: (level: number) => {
		// Tauri doesn't have direct webFrame control, use CSS transform
		document.documentElement.style.setProperty(
			"--zoom-level",

			String(level),
		);
	},
};

// ============================================================================
// Atom: Process (environment and info)
// ============================================================================

const process = {
	platform: (navigator.platform || "unknown").toLowerCase().includes("win")
		? "win32"
		: (navigator.platform || "unknown").toLowerCase().includes("mac")
			? "darwin"
			: "linux",

	arch: "x64", // FUTURE: Detect from Tauri - arch detection requires Tauri platform info
	env: {},

	versions: {
		node: "20.0.0", // Placeholder
		chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "unknown",

		electron: "30.0.0", // Placeholder for compatibility
	},

	cwd: () => "/app",

	shellEnv: async () => ({}),

	getProcessMemoryInfo: async () => ({
		workingSetSize: 0,
		peakWorkingSetSize: 0,
		privateBytes: 0,
		sharedBytes: 0,
	}),

	on: (_type: string, _callback: (error: Error) => void) => {
		// No-op in browser context
	},
};

// ============================================================================
// Atom: Configuration (fetched from Mountain)
// ============================================================================

let CachedConfiguration: any = null;

const context = {
	configuration: async () => {
		if (CachedConfiguration) return CachedConfiguration;

		try {
			const Config = await tauriInvoke(
				"mountain_get_workbench_configuration",
			);

			CachedConfiguration = Config;

			return Config;
		} catch (error) {
			throw error;
		}
	},

	resolveConfiguration: async () => {
		return context.configuration();
	},
};

// ============================================================================
// Atom: WebUtils
// ============================================================================

const webUtils = {
	getPathForFile: (file: File): string => {
		// Tauri doesn't expose full paths for security
		// Return a pseudo-path for compatibility
		return `file://${file.name}`;
	},
};

// ============================================================================
// Atom: Globals Assembly
// ============================================================================

const Globals = {
	ipcRenderer,

	ipcMessagePort,

	webFrame,

	process,

	context,

	webUtils,
};

// ============================================================================
// Atom: Expose to window
// ============================================================================

// `preload-shim` diagnostic tag: fire-and-forget line into Mountain's
// dev-log file sink so `Trace=preload-shim` surfaces exactly when
// `window.vscode` is populated and with which global keys. Silent until
// Tauri is mounted - the legacy `else` branch stayed empty historically;
// emitting there would claim preload success in the Astro SSR pass where
// `window` is a Node polyfill and the shim isn't really in effect.
const _PreloadShimLog = (Message: string): void => {
	try {
		const Internals = (window as any).__TAURI_INTERNALS__;

		const Invoke =
			(window as any).__TAURI__?.core?.invoke ??
			(window as any).__TAURI__?.invoke ??
			Internals?.invoke;

		if (typeof Invoke !== "function") return;

		Invoke("RenderDevLog", {
			Tag: "preload-shim",
			Message,
			tag: "preload-shim",
			message: Message,
		}).catch(() => {});
	} catch {}
};

if (IsTauri) {
	(window as any).vscode = Globals;

	_PreloadShimLog(
		`[Preload] window.vscode installed keys=${Object.keys(Globals).join(",")}`,
	);

	// Dispatch ready event
	window.dispatchEvent(new Event("land-preload-ready"));
} else {
	_PreloadShimLog("[Preload] skipped non-Tauri host");
}

// Export for type checking
export type {};
