/**
 * Import VSCode types for compatibility
 */
import type {
	IpcRenderer,
	IpcRendererEvent,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";

/**
 * @module NativeModulePolyfill
 *
 * @description
 * Polyfill for native Electron modules that the workbench imports.
 * Intercepts `require('electron')` calls and provides shim implementations
 * over Tauri instead of actual Electron modules.
 *
 * @feature_set
 * - Intercept `require('electron')` calls
 * - Provide Electron module APIs as shims over Tauri
 * - Handle `electron.ipcRenderer`, `electron.webFrame`, etc.
 * - Return polyfill implementations instead of actual Electron modules
 *
 * @electron_modules_supported
 * - `electron` → Main Electron module with all sub-modules
 * - `electron.ipcRenderer` → IPCRendererShim
 * - `electron.webFrame` → WebFrame polyfill
 * - `electron.remote` → Not supported (no main process access)
 * - `electron.shell` → Shell operations via Tauri
 * - `electron.dialog` → Dialog via Tauri
 * - `electron.clipboard` → Clipboard via Tauri
 * - `electron.app` → Mock app object
 * - `electron.screen` → Screen via Tauri
 * - `electron.nativeTheme` → NativeTheme via Tauri
 * - `electron.contextBridge` → Not needed (no context isolation in same window)
 *
 * @phase 7 of Approach A3 implementation
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Electron-like module structure
 */
interface ElectronModule {
	ipcRenderer: IpcRenderer;
	webFrame: WebFrame;
	app: App;
	screen: Screen;
	shell: Shell;
	dialog: Dialog;
	clipboard: Clipboard;
	nativeTheme: NativeTheme;
	// remote: Remote; // Not supported - no main process access
	BrowserWindow: BrowserWindow;
	// session: Session; // Not supported
	// webContents: WebContents; // Not supported
	// globalShortcut: GlobalShortcut; // Not supported
}

/**
 * WebFrame interface (partial)
 */
interface WebFrame {
	setZoomLevel(level: number): void;
	setZoomFactor(factor: number): void;
	getZoomFactor(): number;
	getZoomLevel(): number;
	insertCSS(css: string): void;
	insertText(text: string): void;
}

/**
 * App interface (partial, mock for renderer)
 */
interface App {
	getName(): string;
	getVersion(): string;
	getLocale(): string;
	isReady(): boolean;
	whenReady(): Promise<void>;
}

/**
 * Screen interface (partial)
 */
interface Screen {
	getDisplayNearestPoint(point: { x: number; y: number }): {
		id: number;
		bounds: { x: number; y: number; width: number; height: number };
	};
	getPrimaryDisplay(): {
		id: number;
		bounds: { x: number; y: number; width: number; height: number };
	};
	getAllDisplays(): Array<{
		id: number;
		bounds: { x: number; y: number; width: number; height: number };
	}>;
}

/**
 * Shell interface (partial)
 */
interface Shell {
	openExternal(url: string): Promise<void>;
	openPath(path: string): Promise<string>;
	showItemInFolder(path: string): Promise<void>;
	trashItem(path: string): Promise<void>;
	beep(): void;
}

/**
 * Dialog interface (partial)
 */
interface Dialog {
	showOpenDialog(
		options?: unknown,
	): Promise<{ filePaths: string[]; canceled: boolean }>;
	showSaveDialog(
		options?: unknown,
	): Promise<{ filePath: string | undefined; canceled: boolean }>;
	showMessage(message: string): void;
	showError(message: string): void;
}

/**
 * Clipboard interface (partial)
 */
interface Clipboard {
	writeText(text: string): Promise<void>;
	readText(): Promise<string>;
	writeBuffer(format: string, buffer: Buffer): Promise<void>;
	readBuffer(format: string): Promise<Buffer | undefined>;
	clear(): void;
}

/**
 * NativeTheme interface (partial)
 */
interface NativeTheme {
	shouldUseDarkColors: boolean;
	shouldUseInvertedColorScheme: boolean;
	theme: "system" | "light" | "dark";
}

/**
 * BrowserWindow interface (partial, mock for renderer)
 */
interface BrowserWindow {
	id: number;
	isFocused(): boolean;
	focus(): void;
	show(): void;
	hide(): void;
	close(): void;
	isMaximizable(): boolean;
	isMinimizable(): boolean;
	getBounds(): { x: number; y: number; width: number; height: number };
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
			// Colon-prefixed methods (e.g. `file:write`,
			// `shared_process:invoke`) are not registered as direct Tauri
			// commands - Rust function names can't contain colons. They
			// dispatch through Mountain's single `MountainIPCInvoke`
			// command, which unwraps `params` back into the positional
			// `Vec<Value>` the internal handlers consume. Route
			// transparently so this polyfill behaves like the rest of
			// Wind/Sky/Output.
			if (command.includes(":")) {
				return await Invoke("MountainIPCInvoke", {
					method: command,
					params: args,
				});
			}
			return await Invoke(command, args);
		}

		throw new Error(`Tauri invoke not available for command: ${command}`);
	} catch (error: unknown) {
		throw error;
	}
}

// ============================================================================
// Module Cache
// ============================================================================

/**
 * Cache for polyfilled modules
 */
const MODULE_CACHE: Map<
	string,
	| ElectronModule
	| IpcRenderer
	| WebFrame
	| Screen
	| Shell
	| Dialog
	| Clipboard
	| NativeTheme
> = new Map();

/**
 * Get or create cached module
 */
function getCachedModule<T>(key: string, factory: () => T): T {
	if (MODULE_CACHE.has(key)) {
		return MODULE_CACHE.get(key) as T;
	}
	const module = factory();
	MODULE_CACHE.set(key, module as any);
	return module;
}

// ============================================================================
// WebFrame Implementation
// ============================================================================

/**
 * Create WebFrame polyfill
 */
function createWebFrame(): WebFrame {
	return {
		setZoomLevel(level: number): void {
			// This is a no-op in browser as zoom is handled by CSS/transform
		},

		setZoomFactor(factor: number): void {
			// This is a no-op in browser as zoom is handled by CSS/transform
		},

		getZoomFactor(): number {
			return 1.0;
		},

		getZoomLevel(): number {
			return 0;
		},

		insertCSS(css: string): void {
			const style = document.createElement("style");
			style.textContent = css;
			document.head.appendChild(style);
		},

		insertText(text: string): void {
			document.execCommand("insertText", false, text);
		},
	};
}

// ============================================================================
// App Implementation (Mock)
// ============================================================================

/**
 * Create App mock
 */
function createApp(): App {
	return {
		getName(): string {
			return "CodeEditorLand";
		},

		getVersion(): string {
			return "0.0.1";
		},

		getLocale(): string {
			return navigator.language;
		},

		isReady(): boolean {
			return true;
		},

		whenReady(): Promise<void> {
			return Promise.resolve();
		},
	};
}

// ============================================================================
// Screen Implementation
// ============================================================================

/**
 * Create Screen polyfill
 */
function createScreen(): Screen {
	return {
		getDisplayNearestPoint(point: { x: number; y: number }): {
			id: number;
			bounds: { x: number; y: number; width: number; height: number };
		} {
			// Return primary display in browser
			return {
				id: 1,
				bounds: {
					x: 0,
					y: 0,
					width: window.screen.width,
					height: window.screen.height,
				},
			};
		},

		getPrimaryDisplay(): {
			id: number;
			bounds: { x: number; y: number; width: number; height: number };
		} {
			return {
				id: 1,
				bounds: {
					x: window.screen.availLeft,
					y: window.screen.availTop,
					width: window.screen.width,
					height: window.screen.height,
				},
			};
		},

		getAllDisplays(): Array<{
			id: number;
			bounds: { x: number; y: number; width: number; height: number };
		}> {
			return [
				{
					id: 1,
					bounds: {
						x: window.screen.availLeft,
						y: window.screen.availTop,
						width: window.screen.width,
						height: window.screen.height,
					},
				},
			];
		},
	};
}

// ============================================================================
// Shell Implementation
// ============================================================================

/**
 * Create Shell polyfill
 */
function createShell(): Shell {
	return {
		async openExternal(url: string): Promise<void> {
			// Use Tauri's shell module
			try {
				const shell =
					(window as any).__TAURI__?.shell ??
					(window as any).TAURI?.shell;
				if (typeof shell?.open === "function") {
					await shell.open(url);
				} else {
					// Fallback to browser
					window.open(url, "_blank");
				}
			} catch (error) {
				throw error;
			}
		},

		async openPath(path: string): Promise<string> {
			// Not supported in browser
			throw new Error(
				"Shell.openPath is not supported in browser environment",
			);
		},

		async showItemInFolder(path: string): Promise<void> {
			// Not supported in browser
			throw new Error(
				"Shell.showItemInFolder is not supported in browser environment",
			);
		},

		async trashItem(path: string): Promise<void> {
			// Delete item via Mountain
			await invokeTauri("file:delete", { path });
		},

		beep(): void {
			if (typeof AudioContext !== "undefined") {
				const ctx = new AudioContext();
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start();
				osc.stop(ctx.currentTime + 0.1);
			}
		},
	};
}

// ============================================================================
// Dialog Implementation
// ============================================================================

/**
 * Create Dialog polyfill
 */
function createDialog(): Dialog {
	// Electron's showOpenDialog uses `properties: ['openDirectory' | 'openFile'
	// | 'multiSelections' | 'createDirectory']`; Tauri's dialog.open uses
	// `{ directory, multiple, canCreateDirectories }`. VS Code calls the
	// polyfill with Electron-style options, so we translate here - without
	// this, "Open Folder" shows a FILE picker (or nothing, on some Tauri
	// versions) because Tauri sees no `directory: true`.
	const TranslateOpenOptions = (
		Options: Record<string, unknown> | undefined,
	) => {
		if (!Options || typeof Options !== "object") return undefined;
		const Properties = Array.isArray(Options.properties)
			? (Options.properties as string[])
			: [];
		return {
			directory: Properties.includes("openDirectory"),
			multiple: Properties.includes("multiSelections"),
			canCreateDirectories: Properties.includes("createDirectory"),
			defaultPath: Options.defaultPath as string | undefined,
			title: (Options.title as string | undefined) ?? "Open",
			filters: Options.filters as unknown,
			recursive: false,
		};
	};

	const TranslateSaveOptions = (
		Options: Record<string, unknown> | undefined,
	) => {
		if (!Options || typeof Options !== "object") return undefined;
		return {
			defaultPath: Options.defaultPath as string | undefined,
			title: (Options.title as string | undefined) ?? "Save",
			filters: Options.filters as unknown,
		};
	};

	return {
		async showOpenDialog(
			options?: unknown,
		): Promise<{ filePaths: string[]; canceled: boolean }> {
			try {
				const dialog =
					(window as any).__TAURI__?.dialog ??
					(window as any).TAURI?.dialog;
				if (typeof dialog?.open === "function") {
					const Translated = TranslateOpenOptions(
						options as Record<string, unknown>,
					);
					const selected = await dialog.open(Translated);
					return {
						filePaths: Array.isArray(selected)
							? selected
							: selected
								? [selected]
								: [],
						canceled: !selected,
					};
				}
			} catch (error) {
				// Tauri plugin missing or permission denied - log for visibility
				// so "Open Folder" silent failures are grep-able.
				try {
					console.warn(
						"[NativeModulePolyfill] showOpenDialog failed:",
						error,
					);
				} catch {}
			}

			return { filePaths: [], canceled: true };
		},

		async showSaveDialog(
			options?: unknown,
		): Promise<{ filePath: string | undefined; canceled: boolean }> {
			try {
				const dialog =
					(window as any).__TAURI__?.dialog ??
					(window as any).TAURI?.dialog;
				if (typeof dialog?.save === "function") {
					const Translated = TranslateSaveOptions(
						options as Record<string, unknown>,
					);
					const filePath = await dialog.save(Translated);
					return {
						filePath: filePath ?? undefined,
						canceled: !filePath,
					};
				}
			} catch (error) {
				try {
					console.warn(
						"[NativeModulePolyfill] showSaveDialog failed:",
						error,
					);
				} catch {}
			}

			return { filePath: undefined, canceled: true };
		},

		showMessage(message: string): void {
			// Could use Tauri alert or browser alert
			if ((window as any).__TAURI__?.dialog?.message) {
				(window as any).__TAURI__.dialog.message(message);
			} else {
			}
		},

		showError(message: string): void {
			// Could use Tauri alert or browser alert
			if ((window as any).__TAURI__?.dialog?.message) {
				(window as any).__TAURI__.dialog.message("Error: " + message);
			} else {
			}
		},
	};
}

// ============================================================================
// Clipboard Implementation
// ============================================================================

/**
 * Create Clipboard polyfill
 */
function createClipboard(): Clipboard {
	return {
		async writeText(text: string): Promise<void> {
			// Use Tauri's clipboard module
			try {
				const clipboard =
					(window as any).__TAURI__?.clipboard ??
					(window as any).TAURI?.clipboard;
				if (typeof clipboard?.writeText === "function") {
					await clipboard.writeText(text);
				} else {
					// Fallback to browser clipboard
					await navigator.clipboard.writeText(text);
				}
			} catch (error) {
				throw error;
			}
		},

		async readText(): Promise<string> {
			// Use Tauri's clipboard module
			try {
				const clipboard =
					(window as any).__TAURI__?.clipboard ??
					(window as any).TAURI?.clipboard;
				if (typeof clipboard?.readText === "function") {
					return await clipboard.readText();
				}
			} catch (error) {
			}

			// Fallback to browser clipboard
			return await navigator.clipboard.readText();
		},

		async writeBuffer(format: string, buffer: Buffer): Promise<void> {
			// Not fully supported in browser clipboard
			throw new Error("Clipboard.writeBuffer is not fully supported");
		},

		async readBuffer(format: string): Promise<Buffer | undefined> {
			// Not fully supported in browser clipboard
			return undefined;
		},

		clear(): void {
		},
	};
}

// ============================================================================
// NativeTheme Implementation
// ============================================================================

/**
 * Create NativeTheme polyfill
 */
function createNativeTheme(): NativeTheme {
	return {
		get shouldUseDarkColors(): boolean {
			return window.matchMedia("(prefers-color-scheme: dark)").matches;
		},

		get shouldUseInvertedColorScheme(): boolean {
			return false;
		},

		get theme(): "system" | "light" | "dark" {
			// Try to get from Tauri if available
			const tauri = (window as any).__TAURI__ ?? (window as any).TAURI;
			if (tauri?.window?.appWindow?.theme) {
				return tauri.window.appWindow.theme;
			}

			// Fallback to system preference
			return "system";
		},
	};
}

// ============================================================================
// BrowserWindow Implementation (Mock)
// ============================================================================

/**
 * Create BrowserWindow mock for renderer process
 */
function createBrowserWindow(): BrowserWindow {
	return {
		id: 1,
		isFocused(): boolean {
			return document.hasFocus();
		},
		focus(): void {
			window.focus();
		},
		show(): void {
			// No-op in renderer
		},
		hide(): void {
			// No-op in renderer
		},
		close(): void {
			window.close();
		},
		isMaximizable(): boolean {
			return true;
		},
		isMinimizable(): boolean {
			return true;
		},
		getBounds(): { x: number; y: number; width: number; height: number } {
			return {
				x: window.screenX,
				y: window.screenY,
				width: window.innerWidth,
				height: window.innerHeight,
			};
		},
	};
}

// ============================================================================
// Electron Main Module
// ============================================================================

/**
 * Create Electron module with all sub-modules
 */
function createElectronModule(): ElectronModule {
	return {
		ipcRenderer: getCachedModule("ipcRenderer", () => {
			// Import from IPCRendererShim
			const shim = (window as any).__IPC_RENDERER__;
			if (shim) {
				return shim;
			}

			// Basic fallback
			return {
				send: () => {},
				invoke: async () => ({}),
				on: () => ({}),
				once: () => ({}),
				removeListener: () => ({}),
				removeAllListeners: () => ({}),
			} as unknown as IpcRenderer;
		}) as IpcRenderer,

		webFrame: getCachedModule("webFrame", createWebFrame) as WebFrame,
		app: getCachedModule("app", createApp) as App,
		screen: getCachedModule("screen", createScreen) as Screen,
		shell: getCachedModule("shell", createShell) as Shell,
		dialog: getCachedModule("dialog", createDialog) as Dialog,
		clipboard: getCachedModule("clipboard", createClipboard) as Clipboard,
		nativeTheme: getCachedModule(
			"nativeTheme",
			createNativeTheme,
		) as NativeTheme,
		BrowserWindow: createBrowserWindow(),
	};
}

// ============================================================================
// Require Shimming
// ============================================================================

/**
 * Monkey-patch global require() to intercept electron module imports
 */
function installRequireShim(): void {
	if (typeof window === "undefined" || typeof require !== "function") {
		return;
	}

	// Store original require
	const originalRequire = (window as any).require as NodeRequire;

	// Create shim function
	(window as any).require = function (id: string): unknown {

		// Intercept electron module
		if (id === "electron") {
			return createElectronModule();
		}

		// Intercept electron sub-modules
		if (id.startsWith("electron/")) {
			const moduleName = id.replace("electron/", "");
			const electronModule = createElectronModule();

			switch (moduleName) {
				case "ipcRenderer":
					return electronModule.ipcRenderer;
				case "webFrame":
					return electronModule.webFrame;
				case "app":
					return electronModule.app;
				case "screen":
					return electronModule.screen;
				case "shell":
					return electronModule.shell;
				case "dialog":
					return electronModule.dialog;
				case "clipboard":
					return electronModule.clipboard;
				case "nativeTheme":
					return electronModule.nativeTheme;
				case "browserWindow":
				case "BrowserWindow":
					return electronModule.BrowserWindow;
				case "remote":
					throw new Error(
						"electron.remote is not supported in Tauri environment",
					);
				default:
					return {};
			}
		}

		// Use original require for other modules
		return originalRequire(id);
	} as NodeRequire;

	// Copy properties from original require
	Object.keys(originalRequire).forEach((key) => {
		Object.defineProperty((window as any).require, key, {
			...(Object.getOwnPropertyDescriptor(
				originalRequire,
				key,
			) as PropertyDescriptor),
		});
	});
}

// Also need to install the function on its own for later invocations
(window as any).__electron_require__ = (id: string) => {
	if (id === "electron") {
		return createElectronModule();
	}
	if (id.startsWith("electron/")) {
		const moduleName = id.replace("electron/", "");
		const electronModule = createElectronModule();
		switch (moduleName) {
			case "ipcRenderer":
				return electronModule.ipcRenderer;
			case "webFrame":
				return electronModule.webFrame;
			case "app":
				return electronModule.app;
			case "screen":
				return electronModule.screen;
			case "shell":
				return electronModule.shell;
			case "dialog":
				return electronModule.dialog;
			case "clipboard":
				return electronModule.clipboard;
			case "nativeTheme":
				return electronModule.nativeTheme;
			case "BrowserWindow":
				return electronModule.BrowserWindow;
			default:
				return {};
		}
	}
	return undefined;
};

// ============================================================================
// Installation
// ============================================================================

/**
 * Install the native module polyfill
 */
export function installNativeModulePolyfill(): void {
	if (typeof window === "undefined") {
		return;
	}

	// Prevent double installation
	if ((window as any).__NATIVE_MODULE_POLYFILL_INSTALLED__) {
		return;
	}
	(window as any).__NATIVE_MODULE_POLYFILL_INSTALLED__ = true;
	// Install require shim
	installRequireShim();

	// Also make electron directly available on global
	const electronModule = createElectronModule();
	(window as any).electron = electronModule;

	// Attach to window.vscode if available
	if (typeof (window as any).vscode !== "undefined") {
		(window as any).vscode.electron = electronModule;
	}
}

// ============================================================================
// Exports
// ============================================================================

export default {
	install: installNativeModulePolyfill,

	// Individual modules
	createElectronModule,
	createWebFrame,
	createApp,
	createScreen,
	createShell,
	createDialog,
	createClipboard,
	createNativeTheme,
	createBrowserWindow,
};

// Auto-install on import
if (typeof window !== "undefined") {
	installNativeModulePolyfill();
}
