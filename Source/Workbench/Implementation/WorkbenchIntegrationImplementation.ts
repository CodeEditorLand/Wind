/**
 * @module Workbench/Implementation/WorkbenchIntegrationImplementation
 * @description
 * Implementation of VSCode browser workbench integration.
 * Integrates Mountain's file system provider with VSCode's browser workbench by
 * overriding the VSCode workspace API to route operations through Mountain.
 * @see {@link Workbench/Interface/WorkbenchIntegrationService} Service interface
 * @category Implementation
 */

import { Context, Effect, Layer, Queue, Ref, Stream } from "effect";

import { FileSystemProviderTag } from "../../FileSystem/Implementation/FileSystemProviderImplementation.js";
// ============================================================================
// Service Layer
// ============================================================================

import { FileSystemProviderLive } from "../../FileSystem/index.js";
import { URI } from "../../FileSystem/Type/URI.js";
import type { WorkbenchIntegrationService } from "../Interface/WorkbenchIntegrationService.js";
import {
	WorkbenchIntegrationError,
	WorkbenchIntegrationErrorCode,
	WorkbenchState,
	type ProviderRegistrationResult,
	type WorkbenchDiagnostics,
	type WorkbenchInitState,
	type WorkbenchIntegrationConfig,
	type WorkspaceContext,
} from "../Type/WorkbenchIntegrationType.js";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_POLL_INTERVAL = 100; // ms
const DEFAULT_INIT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_REGISTRATION_TIMEOUT = 10000; // 10 seconds

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
// Implementation Context
// ============================================================================

interface WorkbenchIntegrationContext {
	/** Current initialization state */
	readonly stateRef: Ref.Ref<WorkbenchInitState>;

	/** Queue for state change notifications */
	readonly stateQueue: Queue.Queue<WorkbenchInitState>;

	/** Provider registration result */
	readonly registrationResultRef: Ref.Ref<
		ProviderRegistrationResult | undefined
	>;

	/** Workspace context */
	readonly workspaceContextRef: Ref.Ref<WorkspaceContext | undefined>;

	/** Debug mode flag */
	readonly debugModeRef: Ref.Ref<boolean>;

	/** List of diagnostic messages */
	readonly messagesRef: Ref.Ref<
		ReadonlyArray<{
			type: "info" | "warning" | "error";

			message: string;

			timestamp: number;
		}>
	>;

	/** Whether default providers were unregistered */
	readonly defaultProvidersUnregisteredRef: Ref.Ref<boolean>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update the workbench state
 */
const updateState = (
	context: WorkbenchIntegrationContext,

	state: WorkbenchState,

	error?: Error,
) =>
	Effect.gen(function* () {
		const newState: WorkbenchInitState = {
			state,
			lastUpdated: Date.now(),
		};
		yield* Ref.set(context.stateRef, newState);
		yield* Queue.offer(context.stateQueue, newState);
		return newState;
	});

/**
 * Add a diagnostic message
 */
const addMessage = (
	context: WorkbenchIntegrationContext,

	type: "info" | "warning" | "error",

	message: string,
) =>
	Ref.update(context.messagesRef, (messages) => [
		...messages,

		{ type, message, timestamp: Date.now() },
	]);

/**
 * Log a debug message if debug mode is enabled
 */
const debugLog = (context: WorkbenchIntegrationContext, message: string) =>
	Effect.gen(function* () {
		const debugMode = yield* Ref.get(context.debugModeRef);
		if (debugMode) {
		}
	});

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
 * Poll until a condition is met
 */
const pollUntil = (
	condition: () => boolean,

	timeout: number,

	interval: number = DEFAULT_POLL_INTERVAL,
): Effect.Effect<void> =>
	Effect.gen(function* () {
		const startTime = Date.now();

		while (Date.now() - startTime < timeout) {
			if (condition()) {
				return void 0 as void;
			}
			yield* Effect.sleep(interval);
		}

		return yield* Effect.fail(
			new WorkbenchIntegrationError(
				`Timeout after ${timeout}ms waiting for condition to be met`,

				WorkbenchIntegrationErrorCode.InitTimeout,
			),
		);
	});

// ============================================================================
// Service Tag Definition (must be defined before use)
// ============================================================================

export class WorkbenchIntegrationTag extends Context.Tag(
	"WorkbenchIntegration",
)<WorkbenchIntegrationTag, WorkbenchIntegrationService>() {}

// ============================================================================
// Service Implementation
// ============================================================================

const WorkbenchIntegrationServiceLive = Effect.gen(function* () {
	// Initialize context
	const stateRef = yield* Ref.make<WorkbenchInitState>({
		state: WorkbenchState.NotInitialized,
		lastUpdated: Date.now(),
	});

	const stateQueue = yield* Queue.unbounded<WorkbenchInitState>();

	const registrationResultRef = yield* Ref.make<
		ProviderRegistrationResult | undefined
	>(undefined);

	const workspaceContextRef = yield* Ref.make<WorkspaceContext | undefined>(
		undefined,
	);

	const debugModeRef = yield* Ref.make<boolean>(false);

	const messagesRef = yield* Ref.make<
		ReadonlyArray<{
			type: "info" | "warning" | "error";
			message: string;
			timestamp: number;
		}>
	>([]);

	const defaultProvidersUnregisteredRef = yield* Ref.make<boolean>(false);

	const context: WorkbenchIntegrationContext = {
		stateRef,
		stateQueue,
		registrationResultRef,
		workspaceContextRef,
		debugModeRef,
		messagesRef,
		defaultProvidersUnregisteredRef,
	};

	// ============================================================================
	// Service Methods
	// ============================================================================

	const isWorkbenchReady = Effect.sync(() => {
		const vscode = getVSCodeAPI();
		const monacoAvailable = isMonacoAvailable();
		return (
			vscode !== undefined &&
			vscode.workspace !== undefined &&
			monacoAvailable
		);
	});

	const waitForWorkbench: WorkbenchIntegrationService["waitForWorkbench"] = (
		timeout,
	) =>
		Effect.gen(function* () {
			yield* updateState(context, WorkbenchState.WaitingForReady);
			yield* debugLog(
				context,

				`Waiting for workbench to be ready (timeout: ${timeout}ms)...`,
			);

			const vsCodeReady = yield* Effect.either(
				pollUntil(isVSCodeAvailable, timeout).pipe(
					Effect.mapError(
						(_) =>
							new WorkbenchIntegrationError(
								`VSCode API not available after ${timeout}ms`,

								WorkbenchIntegrationErrorCode.InitTimeout,
							),
					),
				),
			);

			if (vsCodeReady._tag === "Left") {
				yield* debugLog(context, "VSCode API check failed");
				return yield* Effect.fail(vsCodeReady.left);
			}

			const monacoReady = yield* Effect.either(
				pollUntil(isMonacoAvailable, timeout).pipe(
					Effect.mapError(
						(_) =>
							new WorkbenchIntegrationError(
								`Monaco editor not available after ${timeout}ms`,

								WorkbenchIntegrationErrorCode.InitTimeout,
							),
					),
				),
			);

			if (monacoReady._tag === "Left") {
				yield* debugLog(context, "Monaco editor check failed");
				return yield* Effect.fail(monacoReady.left);
			}

			yield* debugLog(context, "Workbench is ready");
			yield* updateState(
				context,

				WorkbenchState.ReadyForProviderRegistration,
			);
		});

	const unregisterDefaultProviders: WorkbenchIntegrationService["unregisterDefaultProviders"] =
		Effect.gen(function* () {
			yield* debugLog(
				context,

				"Unregistering default VSCode providers...",
			);

			// Note: In browser workbench, we can't directly unregister providers
			// Instead, we'll override the workspace API routes them to Mountain
			// This is logged for diagnostic purposes
			yield* addMessage(
				context,

				"info",

				"Default providers will be overridden by Mountain provider",
			);

			yield* Ref.set(defaultProvidersUnregisteredRef, true);
			yield* updateState(
				context,

				WorkbenchState.DefaultProvidersUnregistered,
			);

			yield* debugLog(
				context,

				"Default providers unregistered (overridden)",
			);
		});

	const registerProvider: WorkbenchIntegrationService["registerProvider"] = (
		scheme,
	) =>
		Effect.gen(function* () {
			yield* debugLog(
				context,

				`Registering Mountain provider for scheme: ${scheme}...`,
			);

			const fileSystemProviderService = yield* FileSystemProviderTag;
			const provider = yield* Effect.mapError(
				fileSystemProviderService.getProvider,

				(_) =>
					new WorkbenchIntegrationError(
						"Failed to get file system provider",

						WorkbenchIntegrationErrorCode.FileSystemProviderUnavailable,
					),
			);

			// Create a VSCode-compatible file system provider wrapper
			// Note: VSCode passes string URIs, but our provider expects URI objects
			// We'll convert strings to URI objects when calling the provider
			const vscodeProvider: VSCodeFileSystemProvider = {
				readFile: (uriStr: string) =>
					provider.readFile(URI.parse(uriStr)),
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
				readdir: (uriStr: string) =>
					provider.readdir(URI.parse(uriStr)),
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
				return yield* Effect.fail(
					new WorkbenchIntegrationError(
						"VSCode API not available for provider registration",

						WorkbenchIntegrationErrorCode.ServiceUnavailable,
					),
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

			yield* Ref.set(context.registrationResultRef, result);
			yield* updateState(
				context,

				WorkbenchState.MountainProviderRegistered,
			);

			yield* addMessage(
				context,

				"info",

				`Mountain provider registered for scheme: ${scheme}`,
			);
			yield* debugLog(
				context,

				`Mountain provider registered successfully for scheme: ${scheme}`,
			);

			return result;
		});

	const configureWorkspace: WorkbenchIntegrationService["configureWorkspace"] =
		(workspaceContext) =>
			Effect.gen(function* () {
				yield* debugLog(
					context,

					`Configuring workspace: ${workspaceContext.name}...`,
				);

				const vscode = getVSCodeAPI();
				if (!vscode) {
					return yield* Effect.fail(
						new WorkbenchIntegrationError(
							"VSCode API not available for workspace configuration",

							WorkbenchIntegrationErrorCode.ServiceUnavailable,
						),
					);
				}

				// Store workspace context globally
				const globalWindow = window as unknown as Record<
					string,
					unknown
				>;
				globalWindow["__WORKSPACE_CONTEXT__"] = workspaceContext;

				yield* Ref.set(context.workspaceContextRef, workspaceContext);
				yield* updateState(context, WorkbenchState.WorkspaceConfigured);

				yield* addMessage(
					context,

					"info",

					`Workspace configured: ${workspaceContext.name}`,
				);
				yield* debugLog(context, `Workspace configured successfully`);
			});

	const initialize: WorkbenchIntegrationService["initialize"] = (config) =>
		Effect.gen(function* () {
			yield* updateState(context, WorkbenchState.NotInitialized);
			yield* Ref.set(context.debugModeRef, config.debugMode ?? false);

			yield* debugLog(context, "Initializing workbench integration...");
			yield* debugLog(
				context,

				`  - Workspace root: ${config.workspaceRootUri}`,
			);
			yield* debugLog(
				context,

				`  - File scheme: ${config.fileScheme ?? "file"}`,
			);
			yield* debugLog(
				context,

				`  - Override default providers: ${config.overrideDefaultProviders ?? false}`,
			);

			const timeout = config.initTimeout ?? DEFAULT_INIT_TIMEOUT;

			// Wait for workbench to be ready
			yield* Effect.tap(waitForWorkbench(timeout), () =>
				debugLog(context, "Workbench is ready for integration"),
			);

			// Unregister default providers if requested
			if (config.overrideDefaultProviders ?? false) {
				yield* unregisterDefaultProviders;
			}

			// Register Mountain provider
			const scheme = config.fileScheme ?? "file";
			const regResult = yield* registerProvider(scheme);
			if (!regResult.success) {
				return yield* Effect.fail(
					toWorkbenchError(
						regResult.error,

						WorkbenchIntegrationErrorCode.ProviderRegistrationFailed,
					),
				);
			}

			// Configure workspace
			const workspaceContext: WorkspaceContext = {
				rootUri: config.workspaceRootUri,
				name: "CodeEditorLand Workspace",
				isDefault: true,
				folders: [
					{
						uri: config.workspaceRootUri,
						name: "workspace",
					},
				],
			};

			yield* configureWorkspace(workspaceContext);

			yield* updateState(context, WorkbenchState.IntegrationComplete);

			yield* addMessage(
				context,

				"info",

				"Workbench integration complete",
			);
			yield* debugLog(
				context,

				"Workbench integration initialized successfully",
			);
		});

	const getState = Ref.get(context.stateRef);

	const stateChanges = Effect.sync(() =>
		Stream.fromQueue(context.stateQueue),
	);

	const getDiagnostics = Effect.gen(function* () {
		const state = yield* getState;
		const messages = yield* Ref.get(context.messagesRef);
		const registrationResult = yield* Ref.get(
			context.registrationResultRef,
		);
		const workspaceContext = yield* Ref.get(context.workspaceContextRef);
		const defaultProvidersUnregistered = yield* Ref.get(
			context.defaultProvidersUnregisteredRef,
		);

		const diagnostics: WorkbenchDiagnostics = {
			state,
			vscodeAvailable: isVSCodeAvailable(),
			monacoAvailable: isMonacoAvailable(),
			serviceCollectionAccessible: false, // Browser workbench doesn't expose this
			defaultProvidersFound: defaultProvidersUnregistered
				? ["IndexedDB (overridden)"]
				: ["IndexedDB"],
			...(registrationResult !== undefined && { registrationResult }),
			...(workspaceContext !== undefined && { workspaceContext }),
			messages,
		};

		return diagnostics;
	});

	const reset = Effect.gen(function* () {
		yield* debugLog(context, "Resetting workbench integration state...");

		yield* Ref.set(stateRef, {
			state: WorkbenchState.NotInitialized,
			lastUpdated: Date.now(),
		});

		yield* Ref.set(context.registrationResultRef, undefined);
		yield* Ref.set(context.workspaceContextRef, undefined);
		yield* Ref.set(context.messagesRef, []);
		yield* Ref.set(defaultProvidersUnregisteredRef, false);

		// Clear global overrides
		const globalWindow = window as unknown as Record<string, unknown>;
		delete globalWindow["__MOUNTAIN_FS_PROVIDER__"];
		delete globalWindow["__MOUNTAIN_FS_SCHEME__"];
		delete globalWindow["__WORKSPACE_CONTEXT__"];

		yield* debugLog(context, "Workbench integration reset complete");
	});

	return {
		initialize,
		getState,
		stateChanges,
		registerProvider,
		unregisterDefaultProviders,
		configureWorkspace,
		getDiagnostics,
		isWorkbenchReady,
		waitForWorkbench,
		reset,
	};
});

export const WorkbenchIntegrationLiveLayer = Layer.effect(
	WorkbenchIntegrationTag,

	WorkbenchIntegrationServiceLive,
).pipe(Layer.provide(FileSystemProviderLive));

export default WorkbenchIntegrationTag;
