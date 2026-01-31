/**
 * @module Bootstrap/Integration/Services/DialogService
 * @description
 * Dialog service following VSCode IFileDialogService and IWindowService interfaces
 * with Tauri plugin-dialog integration.
 *
 * Features:
 * - Native dialogs via @tauri-apps/plugin-dialog
 * - Browser fallback dialogs when not Tauri
 * - Open/save dialogs with file filters
 * - Multi-selection support
 * - Message dialogs (info, warning, error)
 * - Initial directory support
 * - Effect-TS wrappers for all dialog operations
 *
 * VSCode IFileDialogService Methods:
 * - showOpenDialog(options): Promise<URI[] | undefined>
 * - showSaveDialog(options): Promise<URI | undefined>
 * - showMessageBox(options): Promise<MessageBoxResult>
 *
 * VSCode IWindowService Methods:
 * - showInformationMessage(message, options): Promise<string>
 * - showWarningMessage(message, options): Promise<string>
 * - showErrorMessage(message, options): Promise<string>
 */

import * as Effect from "effect/Effect";

// ============================================================================
// TYPES
// ============================================================================

/**
 * File dialog options for open/save dialogs
 */
export interface FileDialogOptions {
	/**
	 * Dialog title
	 */
	title?: string;

	/**
	 * Default path
	 */
	defaultPath?: string;

	/**
	 * Directory to start in (for open dialogs)
	 */
	directory?: string;

	/**
	 * Allow selecting directories
	 */
	directories?: boolean;

	/**
	 * Allow selecting multiple files
	 */
	multiple?: boolean;

	/**
	 * File filters for selection
	 */
	filters?: FileFilter[];

	/**
	 * Show hidden files
	 */
	hidden?: boolean;
}

/**
 * File filter for dialogs
 */
export interface FileFilter {
	/**
	 * Filter name (e.g., "Text Files")
	 */
	name: string;

	/**
	 * File extensions (e.g., ["txt", "md"])
	 */
	extensions: string[];
}

/**
 * Message box options
 */
export interface MessageBoxOptions {
	/**
	 * Dialog title
	 */
	title?: string;

	/**
	 * Icon type
	 */
	type?: "info" | "warning" | "error" | "question";

	/**
	 * Button labels
	 */
	buttons?: string[];

	/**
	 * Message detail text
	 */
	detail?: string;

	/**
	 * Default button index
	 */
	defaultId?: number;

	/**
	 * Cancel button index
	 */
	cancelId?: number;
}

/**
 * Message box result
 */
export interface MessageBoxResult {
	/**
	 * Selected button index
	 */
	response: number;

	/**
	 * Checkbox checked state
	 */
	checked?: boolean;
}

/**
 * Buttons for message dialogs
 */
export interface MessageButtons {
	/**
	 * Primary button text
	 */
	primary?: string;

	/**
	 * Secondary button text
	 */
	secondary?: string;

	/**
	 * Tertiary button text
	 */
	tertiary?: string;
}

// ============================================================================
// DIALOG SERVICE INTERFACE
// ============================================================================

/**
 * Dialog service interface following VSCode IFileDialogService and IWindowService
 */
export interface DialogService {
	/**
	 * Show file open dialog
	 * @param options - Dialog options
	 * @returns Array of selected file paths (empty if canceled) wrapped in Effect
	 */
	showOpenDialog: (options?: FileDialogOptions) => Effect.Effect<string[]>;

	/**
	 * Show file save dialog
	 * @param options - Dialog options
	 * @returns Selected file path (undefined if canceled) wrapped in Effect
	 */
	showSaveDialog: (
		options?: FileDialogOptions,
	) => Effect.Effect<string | undefined>;

	/**
	 * Show message dialog
	 * @param options - Dialog options
	 * @returns Selected button response wrapped in Effect
	 */
	showMessageBox: (
		options: MessageBoxOptions & { message: string },
	) => Effect.Effect<MessageBoxResult>;

	/**
	 * Show information message
	 * @param message - Message to display
	 * @param buttons - Button labels
	 * @returns Selected button text
	 */
	showInformationMessage: (
		message: string,
		buttons?: MessageButtons,
	) => Effect.Effect<string>;

	/**
	 * Show warning message
	 * @param message - Message to display
	 * @param buttons - Button labels
	 * @returns Selected button text
	 */
	showWarningMessage: (
		message: string,
		buttons?: MessageButtons,
	) => Effect.Effect<string>;

	/**
	 * Show error message
	 * @param message - Message to display
	 * @param buttons - Button labels
	 * @returns Selected button text
	 */
	showErrorMessage: (
		message: string,
		buttons?: MessageButtons,
	) => Effect.Effect<string>;

	/**
	 * Show confirmation dialog
	 * @param message - Confirmation message
	 * @param title - Dialog title
	 * @returns true if confirmed, false otherwise
	 */
	showConfirmDialog: (
		message: string,
		title?: string,
	) => Effect.Effect<boolean>;

	/**
	 * Show file picker for picking a directory
	 * @param startPath - Starting directory path
	 * @returns Selected directory path (undefined if canceled)
	 */
	showDirectoryPicker: (
		startPath?: string,
	) => Effect.Effect<string | undefined>;
}

// ============================================================================
// CONTEXT TAG
// ============================================================================

export const DialogServiceTag = Effect.Tag<DialogService, DialogService>(
	"DialogService",
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Tauri is available in the environment
 */
function isTauriAvailable(): boolean {
	return typeof (globalThis as any).__TAURI__ !== "undefined";
}

/**
 * Convert VSCode FileFilter to Tauri dialog filter format
 */
function convertFiltersToTauri(
	filters?: FileFilter[],
): Array<{ name: string; extensions: string[] }> | undefined {
	if (!filters || filters.length === 0) {
		return undefined;
	}
	return filters.map((f) => ({
		name: f.name,
		extensions: f.extensions,
	}));
}

/**
 * Convert MessageButtons to array of labels
 */
function convertButtonsToLabels(
	buttons?: MessageButtons,
): string[] | undefined {
	if (!buttons) {
		return undefined;
	}
	const labels: string[] = [];
	if (buttons.primary) labels.push(buttons.primary);
	if (buttons.secondary) labels.push(buttons.secondary);
	if (buttons.tertiary) labels.push(buttons.tertiary);
	return labels.length > 0 ? labels : undefined;
}

// ============================================================================
// BROWSER FALLBACK IMPLEMENTATIONS
// ============================================================================

/**
 * Browser fallback for file open dialog
 */
function browserOpenDialog(options?: FileDialogOptions): Promise<string[]> {
	return new Promise((resolve) => {
		resolve([]); // Cannot show native dialog in browser
	});
}

/**
 * Browser fallback for file save dialog
 */
function browserSaveDialog(
	options?: FileDialogOptions,
): Promise<string | undefined> {
	return Promise.resolve(undefined);
}

/**
 * Browser fallback for message dialog
 */
function browserMessageBox(
	options: MessageBoxOptions & { message: string },
): Promise<MessageBoxResult> {
	return new Promise((resolve) => {
		let icon = "";
		switch (options.type) {
			case "warning":
				icon = "⚠️ ";
				break;
			case "error":
				icon = "❌ ";
				break;
			case "question":
				icon = "❓ ";
				break;
			default:
				icon = "ℹ️ ";
		}
		const message = `${icon}${options.message}`;
		const confirmed = window.confirm(message);
		resolve({ response: confirmed ? 0 : 1 });
	});
}

/**
 * Browser fallback for showInformationMessage
 */
function browserInfoMessage(
	message: string,
	buttons?: MessageButtons,
): Promise<string> {
	const labels = convertButtonsToLabels(buttons);
	if (labels && labels.length > 1) {
		return new Promise((resolve) => {
			const confirmed = window.confirm(
				`${message}\n\n${labels.join(" | ")}`,
			);
			resolve(confirmed ? labels[0] : labels[labels.length - 1]);
		});
	}
	window.alert(message);
	return Promise.resolve(buttons?.primary || "OK");
}

/**
 * Browser fallback for showWarningMessage
 */
function browserWarningMessage(
	message: string,
	buttons?: MessageButtons,
): Promise<string> {
	const labels = convertButtonsToLabels(buttons);
	if (labels && labels.length > 1) {
		return new Promise((resolve) => {
			const confirmed = window.confirm(
				`⚠️ WARNING\n\n${message}\n\n${labels.join(" | ")}`,
			);
			resolve(confirmed ? labels[0] : labels[labels.length - 1]);
		});
	}
	window.confirm(`⚠️ WARNING\n\n${message}`);
	return Promise.resolve(buttons?.primary || "OK");
}

/**
 * Browser fallback for showErrorMessage
 */
function browserErrorMessage(
	message: string,
	buttons?: MessageButtons,
): Promise<string> {
	const labels = convertButtonsToLabels(buttons);
	if (labels && labels.length > 1) {
		return new Promise((resolve) => {
			const confirmed = window.confirm(
				`❌ ERROR\n\n${message}\n\n${labels.join(" | ")}`,
			);
			resolve(confirmed ? labels[0] : labels[labels.length - 1]);
		});
	}
	window.alert(`❌ ERROR\n\n${message}`);
	return Promise.resolve(buttons?.primary || "OK");
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

const DialogServiceImpl = DialogServiceTag.of({
	showOpenDialog: (options?: FileDialogOptions) => {
		return Effect.tryPromise({
			try: async () => {
				// Browser fallback
				if (!isTauriAvailable()) {
					return await browserOpenDialog(options);
				}

				// Tauri native dialog
				const dialog = await import("@tauri-apps/plugin-dialog");

				// Convert options
				const tauriOptions: any = {
					multiple: options?.multiple || false,
					recursive: options?.directories || false,
				};

				if (options?.title) tauriOptions.title = options.title;
				if (options?.defaultPath)
					tauriOptions.defaultPath = options.defaultPath;
				if (options?.directory)
					tauriOptions.directory = options.directory;
				if (options?.hidden !== undefined)
					tauriOptions.hidden = options.hidden;

				const filters = convertFiltersToTauri(options?.filters);
				if (filters && filters.length > 0) {
					tauriOptions.filters = filters;
				}

				// Show dialog and convert result
				const result = await dialog.open(tauriOptions);

				if (result === null || result === undefined) {
					return [];
				}

				// Ensure we return an array
				return Array.isArray(result) ? result : [result];
			},
			catch: (error) => {
				console.error("[DialogService] Open dialog error:", error);
				return [];
			},
		});
	},

	showSaveDialog: (options?: FileDialogOptions) => {
		return Effect.tryPromise({
			try: async () => {
				// Browser fallback
				if (!isTauriAvailable()) {
					return await browserSaveDialog(options);
				}

				// Tauri native dialog
				const dialog = await import("@tauri-apps/plugin-dialog");

				// Convert options
				const tauriOptions: any = {};

				if (options?.title) tauriOptions.title = options.title;
				if (options?.defaultPath)
					tauriOptions.defaultPath = options.defaultPath;
				if (options?.hidden !== undefined)
					tauriOptions.hidden = options.hidden;

				const filters = convertFiltersToTauri(options?.filters);
				if (filters && filters.length > 0) {
					tauriOptions.filters = filters;
				}

				// Show dialog
				return await dialog.save(tauriOptions);
			},
			catch: (error) => {
				console.error("[DialogService] Save dialog error:", error);
				return undefined;
			},
		});
	},

	showMessageBox: (options: MessageBoxOptions & { message: string }) => {
		return Effect.tryPromise({
			try: async () => {
				// Browser fallback
				if (!isTauriAvailable()) {
					return await browserMessageBox(options);
				}

				// Tauri native dialog
				const dialog = await import("@tauri-apps/plugin-dialog");

				// Convert options
				const tauriOptions: any = {
					title: options.title || "",
					message: options.message,
				};

				if (options.buttons && options.buttons.length > 0) {
					tauriOptions.buttons = options.buttons;
				}
				if (options.type) tauriOptions.type = options.type;
				if (options.detail) tauriOptions.detail = options.detail;
				if (options.defaultId !== undefined) {
					tauriOptions.defaultId = options.defaultId;
				}
				if (options.cancelId !== undefined) {
					tauriOptions.cancelId = options.cancelId;
				}

				// Show dialog
				return await dialog.message(tauriOptions);
			},
			catch: (error) => {
				console.error("[DialogService] Message dialog error:", error);
				return { response: 1 }; // Return default cancel response
			},
		});
	},

	showInformationMessage: (message: string, buttons?: MessageButtons) => {
		return Effect.flatMap(DialogServiceTag, (service) => {
			// Browser fallback
			if (!isTauriAvailable()) {
				return Effect.tryPromise({
					try: async () => await browserInfoMessage(message, buttons),
					catch: () => "OK",
				});
			}

			// Tauri native dialog
			const labels = convertButtonsToLabels(buttons);

			// Convert to MessageBoxOptions
			const msgOptions: MessageBoxOptions & { message: string } = {
				message,
				type: "info",
				title: "Information",
				buttons: labels || ["OK"],
			};

			return Effect.tryPromise({
				try: async () => {
					const result = await service.showMessageBox(msgOptions);
					const selectedButton = result.buttons?.[result.response];
					return selectedButton || buttons?.primary || "OK";
				},
				catch: () => "OK",
			});
		});
	},

	showWarningMessage: (message: string, buttons?: MessageButtons) => {
		return Effect.flatMap(DialogServiceTag, (service) => {
			// Browser fallback
			if (!isTauriAvailable()) {
				return Effect.tryPromise({
					try: async () =>
						await browserWarningMessage(message, buttons),
					catch: () => "OK",
				});
			}

			// Tauri native dialog
			const labels = convertButtonsToLabels(buttons);

			// Convert to MessageBoxOptions
			const msgOptions: MessageBoxOptions & { message: string } = {
				message,
				type: "warning",
				title: "Warning",
				buttons: labels || ["OK"],
			};

			return Effect.tryPromise({
				try: async () => {
					const result = await service.showMessageBox(msgOptions);
					const selectedButton = result.buttons?.[result.response];
					return selectedButton || buttons?.primary || "OK";
				},
				catch: () => "OK",
			});
		});
	},

	showErrorMessage: (message: string, buttons?: MessageButtons) => {
		return Effect.flatMap(DialogServiceTag, (service) => {
			// Browser fallback
			if (!isTauriAvailable()) {
				return Effect.tryPromise({
					try: async () =>
						await browserErrorMessage(message, buttons),
					catch: () => "OK",
				});
			}

			// Tauri native dialog
			const labels = convertButtonsToLabels(buttons);

			// Convert to MessageBoxOptions
			const msgOptions: MessageBoxOptions & { message: string } = {
				message,
				type: "error",
				title: "Error",
				buttons: labels || ["OK"],
			};

			return Effect.tryPromise({
				try: async () => {
					const result = await service.showMessageBox(msgOptions);
					const selectedButton = result.buttons?.[result.response];
					return selectedButton || buttons?.primary || "OK";
				},
				catch: () => "OK",
			});
		});
	},

	showConfirmDialog: (message: string, title?: string) => {
		return Effect.flatMap(DialogServiceTag, (service) => {
			return Effect.tryPromise({
				try: async () => {
					// Use message box for confirmation
					const result = await Effect.runPromise(
						service.showMessageBox({
							message,
							title: title || "Confirm",
							type: "question",
							buttons: ["OK", "Cancel"],
							cancelId: 1,
						}),
					);
					return result.response === 0;
				},
				catch: () => false,
			});
		});
	},

	showDirectoryPicker: (startPath?: string) => {
		return Effect.flatMap(DialogServiceTag, (service) => {
			return Effect.map(
				service.showOpenDialog({
					title: "Select Directory",
					directories: true,
					defaultPath: startPath,
					multiple: false,
				}),
				(paths) => {
					return paths.length > 0 ? paths[0] : undefined;
				},
			);
		});
	},
});

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create the dialog service layer
 */
export function createDialogServiceLayer(): Effect.Layer<never> {
	return DialogServiceTag.provide(DialogServiceImpl);
}

// ============================================================================
// EFFECT-TS WRAPPERS
// ============================================================================

/**
 * Effect wrapper for file open dialog
 */
export const showOpenDialogEffect = (
	options?: FileDialogOptions,
): Effect.Effect<string[]> => {
	return Effect.flatMap(DialogServiceTag, (service) =>
		service.showOpenDialog(options),
	);
};

/**
 * Effect wrapper for file save dialog
 */
export const showSaveDialogEffect = (
	options?: FileDialogOptions,
): Effect.Effect<string | undefined> => {
	return Effect.flatMap(DialogServiceTag, (service) =>
		service.showSaveDialog(options),
	);
};

/**
 * Effect wrapper for message box
 */
export const showMessageBoxEffect = (
	options: MessageBoxOptions & { message: string },
): Effect.Effect<MessageBoxResult> => {
	return Effect.flatMap(DialogServiceTag, (service) =>
		service.showMessageBox(options),
	);
};

/**
 * Effect wrapper for information message
 */
export const showInformationMessageEffect = (
	message: string,
	buttons?: MessageButtons,
): Effect.Effect<string> => {
	return Effect.flatMap(DialogServiceTag, (service) =>
		service.showInformationMessage(message, buttons),
	);
};

/**
 * Effect wrapper for warning message
 */
export const showWarningMessageEffect = (
	message: string,
	buttons?: MessageButtons,
): Effect.Effect<string> => {
	return Effect.flatMap(DialogServiceTag, (service) =>
		service.showWarningMessage(message, buttons),
	);
};

/**
 * Effect wrapper for error message
 */
export const showErrorMessageEffect = (
	message: string,
	buttons?: MessageButtons,
): Effect.Effect<string> => {
	return Effect.flatMap(DialogServiceTag, (service) =>
		service.showErrorMessage(message, buttons),
	);
};

/**
 * Effect wrapper for confirmation dialog
 */
export const showConfirmDialogEffect = (
	message: string,
	title?: string,
): Effect.Effect<boolean> => {
	return Effect.flatMap(DialogServiceTag, (service) =>
		service.showConfirmDialog(message, title),
	);
};

/**
 * Effect wrapper for directory picker
 */
export const showDirectoryPickerEffect = (
	startPath?: string,
): Effect.Effect<string | undefined> => {
	return Effect.flatMap(DialogServiceTag, (service) =>
		service.showDirectoryPicker(startPath),
	);
};

// ============================================================================
// PRE-CONFIGURED DIALOG HELPERS
// ============================================================================

/**
 * Show dialog asking user to confirm before closing unsaved changes
 */
export const confirmCloseUnsaved = (): Effect.Effect<boolean> => {
	return showConfirmDialogEffect(
		"Do you want to save changes before closing?",
		"Unsaved Changes",
	);
};

/**
 * Show dialog for overwrite confirmation
 */
export const confirmOverwrite = (filePath: string): Effect.Effect<boolean> => {
	return showConfirmDialogEffect(
		`File "${filePath}" already exists. Do you want to overwrite it?`,
		"Confirm Overwrite",
	);
};

export default DialogServiceTag;
