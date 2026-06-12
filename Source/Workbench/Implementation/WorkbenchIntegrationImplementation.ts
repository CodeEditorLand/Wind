/**
 * @module Workbench/Implementation/WorkbenchIntegrationImplementation
 * @description
 * Implementation of VSCode browser workbench integration.
 * Integrates Mountain's file system provider with VSCode's browser workbench by
 * overriding the VSCode workspace API to route operations through Mountain.
 * All methods are plain sync/async and throw `WorkbenchIntegrationError` on failure.
 * @see {@link Workbench/Interface/WorkbenchIntegrationService} Service interface
 * @category Implementation
 */

import FileSystemProvider from "../../FileSystem/Implementation/FileSystemProviderImplementation.js";
import type { IDisposable } from "../../FileSystem/Type/FileSystemType.js";
import { URI } from "../../FileSystem/Type/URI.js";
import type { WorkbenchIntegrationService } from "../Interface/WorkbenchIntegrationService.js";
import {
	type ProviderRegistrationResult,
	type WorkbenchDiagnostics,
	type WorkbenchInitState,
	type WorkbenchIntegrationConfig,
	WorkbenchIntegrationError,
	WorkbenchIntegrationErrorCode,
	WorkbenchState,
	type WorkspaceContext,
} from "../Type/WorkbenchIntegrationType.js";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_POLL_INTERVAL = 100; // ms

const DEFAULT_INIT_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Types for VSCode API (Browser Workbench)
// ============================================================================

/**
 * VSCode workspace API interface (simplified for browser workbench)
 */
interface VSCodeWorkspace {
	/**
	 * Get the workspace root folder
	 */
	readonly rootPath?: string;

	/**
	 * Get the workspace folders
	 */
	readonly workspaceFolders?: readonly VSCodeWorkspaceFolder[];
}

/**
 * VSCode workspace folder interface
 */
interface VSCodeWorkspaceFolder {
	/** URI of the workspace folder */
	readonly uri: string;

	/** Name of the workspace folder */
	readonly name: string;

	/** Index of the workspace folder */
	readonly index: number;
}

/**
 * VSCode file system provider API (if accessible)
 */
interface VSCodeFileSystemProvider {
	/**
	 * Read file contents
	 */
	readonly readFile: (uri: string) => Promise<Uint8Array>;

	/**
	 * Write file contents
	 */
	readonly writeFile: (
		uri: string,

		content: Uint8Array,

		options?: { create?: boolean; overwrite?: boolean },
	) => Promise<void>;

	/**
	 * Delete a file or directory
	 */
	readonly delete: (uri: string) => Promise<void>;

	/**
	 * Copy a file or directory
	 */
	readonly copy: (source: string, destination: string) => Promise<void>;

	/**
	 * Move a file or directory
	 */
	readonly move: (source: string, destination: string) => Promise<void>;

	/**
	 * List directory contents
	 */
	readonly readdir: (uri: string) => Promise<[string, number][]>;

	/**
	 * Create a directory
	 */
	readonly mkdir: (
		uri: string,

		options?: { recursive?: boolean },
	) => Promise<void>;

	/**
	 * Remove a directory
	 */
	readonly rmdir: (uri: string) => Promise<void>;

	/**
	 * Get file/directory statistics
	 */
	readonly stat: (uri: string) => Promise<{
		type: number;

		size: number;

		ctime: number;

		mtime: number;

		permissions?: number;
	}>;
}

/**
 * VSCode API interface (window.vscode)
 */
interface VSCodeAPI {
	/** Workspace API */
	readonly workspace?: VSCodeWorkspace;

	/** IPC renderer (from Wind preload) */
	readonly ipcRenderer?: {
		readonly invoke: (
			channel: string,
			...args: unknown[]
		) => Promise<unknown>;
	};

	/** Process information (from Wind preload) */
	readonly process?: {
		readonly platform: string;

		readonly arch: string;

		readonly type: string;
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a workbench integration error with code
 */
const toWorkbenchError = (
	error: unknown,

	code: WorkbenchIntegrationErrorCode,
): WorkbenchIntegrationError => {
	if (error instanceof WorkbenchIntegrationError) {
		return error;
	}

	if (error instanceof Error) {
		return new WorkbenchIntegrationError(error.message, code);
	}

	return new WorkbenchIntegrationError(
		String(error),

		WorkbenchIntegrationErrorCode.Unknown,
	);
};

/**
 * Check if VSCode API is available
 */
const isVSCodeAvailable = (): boolean => {
	return (
		typeof window !== "undefined" &&
		typeof (window as unknown as { vscode?: VSCodeAPI }).vscode !==
			"undefined"
	);
};

/**
 * Check if Monaco editor is available
 */
const isMonacoAvailable = (): boolean => {
	return (
		typeof window !== "undefined" &&
		typeof (window as unknown as { monaco?: unknown }).monaco !==
			"undefined"
	);
};

/**
 * Get VSCode API
 */
const getVSCodeAPI = (): VSCodeAPI | undefined => {
	if (typeof window === "undefined") {
		return undefined;
	}

	return (window as { vscode?: VSCodeAPI }).vscode;
};

/**
 * Poll until a condition is met.
 * Checks immediately, then every `interval` ms via `setInterval`; the
 * pending interval and timeout are released through an `AbortController`
 * as soon as either branch of the race settles.
 * @param condition - Predicate to poll
 * @param timeout - Hard timeout in milliseconds
 * @param interval - Poll cadence in milliseconds
 * @throws WorkbenchIntegrationError with code `InitTimeout` on expiry
 */
const pollUntil = (
	condition: () => boolean,

	timeout: number,

	interval: number = DEFAULT_POLL_INTERVAL,
): Promise<void> => {
	const controller = new AbortController();

	const pollLoop = new Promise<void>((resolve) => {
		if (condition()) {
			resolve();

			return;
		}

		const handle = setInterval(() => {
			if (condition()) {
				clearInterval(handle);

				resolve();
			}
		}, interval);

		controller.signal.addEventListener(
			"abort",
			() => {
				clearInterval(handle);
			},
			{ once: true },
		);
	});

	const expiry = new Promise<never>((_resolve, reject) => {
		const handle = setTimeout(() => {
			reject(
				new WorkbenchIntegrationError(
					`Timeout after ${timeout}ms waiting for condition to be met`,

					WorkbenchIntegrationErrorCode.InitTimeout,
				),
			);
		}, timeout);

		controller.signal.addEventListener(
			"abort",
			() => {
				clearTimeout(handle);
			},
			{ once: true },
		);
	});

	return Promise.race([pollLoop, expiry]).finally(() => {
		controller.abort();
	});
};

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Build the WorkbenchIntegration service. State lives in module-closure
 * `let`s; state-change observation uses a listener `Set` instead of a
 * queue-backed stream.
 */
const buildWorkbenchIntegrationService = (): WorkbenchIntegrationService => {
	let currentState: WorkbenchInitState = {
		state: WorkbenchState.NotInitialized,
		lastUpdated: Date.now(),
	};

	const stateListeners = new Set<(state: WorkbenchInitState) => void>();

	let registrationResult: ProviderRegistrationResult | undefined;

	let workspaceContext: WorkspaceContext | undefined;

	let messages: ReadonlyArray<{
		type: "info" | "warning" | "error";

		message: string;

		timestamp: number;
	}> = [];

	let defaultProvidersUnregistered = false;

	const updateState = (state: WorkbenchState): WorkbenchInitState => {
		const newState: WorkbenchInitState = {
			state,
			lastUpdated: Date.now(),
		};

		currentState = newState;

		for (const listener of stateListeners) {
			listener(newState);
		}

		return newState;
	};

	const addMessage = (
		type: "info" | "warning" | "error",

		message: string,
	): void => {
		messages = [...messages, { type, message, timestamp: Date.now() }];
	};

	const isWorkbenchReady: WorkbenchIntegrationService["isWorkbenchReady"] =
		() => {
			const vscode = getVSCodeAPI();

			return (
				vscode !== undefined &&
				vscode.workspace !== undefined &&
				isMonacoAvailable()
			);
		};

	const waitForWorkbench: WorkbenchIntegrationService["waitForWorkbench"] =
		async (timeout) => {
			updateState(WorkbenchState.WaitingForReady);

			try {
				await pollUntil(isVSCodeAvailable, timeout);
			} catch {
				throw new WorkbenchIntegrationError(
					`VSCode API not available after ${timeout}ms`,

					WorkbenchIntegrationErrorCode.InitTimeout,
				);
			}

			try {
				await pollUntil(isMonacoAvailable, timeout);
			} catch {
				throw new WorkbenchIntegrationError(
					`Monaco editor not available after ${timeout}ms`,

					WorkbenchIntegrationErrorCode.InitTimeout,
				);
			}

			updateState(WorkbenchState.ReadyForProviderRegistration);
		};

	const unregisterDefaultProviders: WorkbenchIntegrationService["unregisterDefaultProviders"] =
		() => {
			// Note: In browser workbench, we can't directly unregister providers
			// Instead, we'll override the workspace API routes them to Mountain
			// This is logged for diagnostic purposes
			addMessage(
				"info",

				"Default providers will be overridden by Mountain provider",
			);

			defaultProvidersUnregistered = true;

			updateState(WorkbenchState.DefaultProvidersUnregistered);
		};

	const registerProvider: WorkbenchIntegrationService["registerProvider"] = (
		scheme,
	) => {
		const provider = FileSystemProvider.provider;

		// Create a VSCode-compatible file system provider wrapper
		// Note: VSCode passes string URIs, but our provider expects URI objects
		// We'll convert strings to URI objects when calling the provider
		const vscodeProvider: VSCodeFileSystemProvider = {
			readFile: (uriStr: string) => provider.readFile(URI.parse(uriStr)),
			writeFile: (uriStr: string, content: Uint8Array, options) =>
				provider.writeFile(
					URI.parse(uriStr),

					content,

					options
						? {
								create: options.create ?? true,
								overwrite: options.overwrite ?? false,
							}
						: undefined,
				),
			delete: (uriStr: string) => provider.delete(URI.parse(uriStr)),
			copy: (sourceStr: string, destinationStr: string) =>
				provider.copy(
					URI.parse(sourceStr),

					URI.parse(destinationStr),
				),
			move: (sourceStr: string, destinationStr: string) =>
				provider.move(
					URI.parse(sourceStr),

					URI.parse(destinationStr),
				),
			readdir: (uriStr: string) => provider.readdir(URI.parse(uriStr)),
			mkdir: (uriStr: string, options) =>
				provider.mkdir(URI.parse(uriStr), {
					recursive: options?.recursive ?? false,
				}),
			rmdir: (uriStr: string) => provider.rmdir(URI.parse(uriStr)),
			stat: (uriStr: string) => provider.stat(URI.parse(uriStr)),
		};

		// Override VSCode's file operations by intercepting calls
		// Since browser workbench doesn't provide direct access to file service registration,
		// we override the global window object's file-related methods
		// This is Option A from the integration approach

		const vscode = getVSCodeAPI();

		if (!vscode) {
			throw new WorkbenchIntegrationError(
				"VSCode API not available for provider registration",

				WorkbenchIntegrationErrorCode.ServiceUnavailable,
			);
		}

		// Store the provider globally for VSCode to use
		// Workbench will call this provider for file operations
		const globalWindow = window as unknown as Record<string, unknown>;

		globalWindow["__MOUNTAIN_FS_PROVIDER__"] = vscodeProvider;

		globalWindow["__MOUNTAIN_FS_SCHEME__"] = scheme;

		const result: ProviderRegistrationResult = {
			success: true,
			providerName: "MountainFileSystemProvider",
			scheme,
			details: {
				method: "API override (Option A)",
				timestamp: Date.now(),
			},
		};

		registrationResult = result;

		updateState(WorkbenchState.MountainProviderRegistered);

		addMessage(
			"info",

			`Mountain provider registered for scheme: ${scheme}`,
		);

		return result;
	};

	const configureWorkspace: WorkbenchIntegrationService["configureWorkspace"] =
		(workspaceContextValue) => {
			const vscode = getVSCodeAPI();

			if (!vscode) {
				throw new WorkbenchIntegrationError(
					"VSCode API not available for workspace configuration",

					WorkbenchIntegrationErrorCode.ServiceUnavailable,
				);
			}

			// Store workspace context globally
			const globalWindow = window as unknown as Record<string, unknown>;

			globalWindow["__WORKSPACE_CONTEXT__"] = workspaceContextValue;

			workspaceContext = workspaceContextValue;

			updateState(WorkbenchState.WorkspaceConfigured);

			addMessage(
				"info",

				`Workspace configured: ${workspaceContextValue.name}`,
			);
		};

	const initialize: WorkbenchIntegrationService["initialize"] = async (
		config: WorkbenchIntegrationConfig,
	) => {
		updateState(WorkbenchState.NotInitialized);

		const timeout = config.initTimeout ?? DEFAULT_INIT_TIMEOUT;

		// Wait for workbench to be ready
		await waitForWorkbench(timeout);

		// Unregister default providers if requested
		if (config.overrideDefaultProviders ?? false) {
			unregisterDefaultProviders();
		}

		// Register Mountain provider
		const scheme = config.fileScheme ?? "file";

		const regResult = registerProvider(scheme);

		if (!regResult.success) {
			throw toWorkbenchError(
				regResult.error,

				WorkbenchIntegrationErrorCode.ProviderRegistrationFailed,
			);
		}

		// Configure workspace
		configureWorkspace({
			rootUri: config.workspaceRootUri,
			name: "CodeEditorLand Workspace",
			isDefault: true,
			folders: [
				{
					uri: config.workspaceRootUri,
					name: "workspace",
				},
			],
		});

		updateState(WorkbenchState.IntegrationComplete);

		addMessage("info", "Workbench integration complete");
	};

	const getState: WorkbenchIntegrationService["getState"] = () =>
		currentState;

	const onStateChange: WorkbenchIntegrationService["onStateChange"] = (
		listener,
	): IDisposable => {
		stateListeners.add(listener);

		return {
			dispose: () => {
				stateListeners.delete(listener);
			},
		};
	};

	const getDiagnostics: WorkbenchIntegrationService["getDiagnostics"] =
		() => {
			const diagnostics: WorkbenchDiagnostics = {
				state: currentState,
				vscodeAvailable: isVSCodeAvailable(),
				monacoAvailable: isMonacoAvailable(),
				serviceCollectionAccessible: false, // Browser workbench doesn't expose this
				defaultProvidersFound: defaultProvidersUnregistered
					? ["IndexedDB (overridden)"]
					: ["IndexedDB"],
				...(registrationResult !== undefined && {
					registrationResult,
				}),
				...(workspaceContext !== undefined && { workspaceContext }),
				messages,
			};

			return diagnostics;
		};

	const reset: WorkbenchIntegrationService["reset"] = () => {
		currentState = {
			state: WorkbenchState.NotInitialized,
			lastUpdated: Date.now(),
		};

		registrationResult = undefined;

		workspaceContext = undefined;

		messages = [];

		defaultProvidersUnregistered = false;

		// Clear global overrides
		const globalWindow = window as unknown as Record<string, unknown>;

		delete globalWindow["__MOUNTAIN_FS_PROVIDER__"];

		delete globalWindow["__MOUNTAIN_FS_SCHEME__"];

		delete globalWindow["__WORKSPACE_CONTEXT__"];
	};

	return {
		initialize,
		getState,
		onStateChange,
		registerProvider,
		unregisterDefaultProviders,
		configureWorkspace,
		getDiagnostics,
		isWorkbenchReady,
		waitForWorkbench,
		reset,
	} satisfies WorkbenchIntegrationService;
};

const WorkbenchIntegration = buildWorkbenchIntegrationService();

// ============================================================================
// Exports
// ============================================================================

export { WorkbenchIntegration };

export default WorkbenchIntegration;
