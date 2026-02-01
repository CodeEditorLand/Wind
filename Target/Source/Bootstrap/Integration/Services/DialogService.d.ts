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
    showSaveDialog: (options?: FileDialogOptions) => Effect.Effect<string | undefined>;
    /**
     * Show message dialog
     * @param options - Dialog options
     * @returns Selected button response wrapped in Effect
     */
    showMessageBox: (options: MessageBoxOptions & {
        message: string;
    }) => Effect.Effect<MessageBoxResult>;
    /**
     * Show information message
     * @param message - Message to display
     * @param buttons - Button labels
     * @returns Selected button text
     */
    showInformationMessage: (message: string, buttons?: MessageButtons) => Effect.Effect<string>;
    /**
     * Show warning message
     * @param message - Message to display
     * @param buttons - Button labels
     * @returns Selected button text
     */
    showWarningMessage: (message: string, buttons?: MessageButtons) => Effect.Effect<string>;
    /**
     * Show error message
     * @param message - Message to display
     * @param buttons - Button labels
     * @returns Selected button text
     */
    showErrorMessage: (message: string, buttons?: MessageButtons) => Effect.Effect<string>;
    /**
     * Show confirmation dialog
     * @param message - Confirmation message
     * @param title - Dialog title
     * @returns true if confirmed, false otherwise
     */
    showConfirmDialog: (message: string, title?: string) => Effect.Effect<boolean>;
    /**
     * Show file picker for picking a directory
     * @param startPath - Starting directory path
     * @returns Selected directory path (undefined if canceled)
     */
    showDirectoryPicker: (startPath?: string) => Effect.Effect<string | undefined>;
}
export declare const DialogServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, DialogService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/**
 * Create the dialog service layer
 */
export declare function createDialogServiceLayer(): Effect.Layer<never>;
/**
 * Effect wrapper for file open dialog
 */
export declare const showOpenDialogEffect: (options?: FileDialogOptions) => Effect.Effect<string[]>;
/**
 * Effect wrapper for file save dialog
 */
export declare const showSaveDialogEffect: (options?: FileDialogOptions) => Effect.Effect<string | undefined>;
/**
 * Effect wrapper for message box
 */
export declare const showMessageBoxEffect: (options: MessageBoxOptions & {
    message: string;
}) => Effect.Effect<MessageBoxResult>;
/**
 * Effect wrapper for information message
 */
export declare const showInformationMessageEffect: (message: string, buttons?: MessageButtons) => Effect.Effect<string>;
/**
 * Effect wrapper for warning message
 */
export declare const showWarningMessageEffect: (message: string, buttons?: MessageButtons) => Effect.Effect<string>;
/**
 * Effect wrapper for error message
 */
export declare const showErrorMessageEffect: (message: string, buttons?: MessageButtons) => Effect.Effect<string>;
/**
 * Effect wrapper for confirmation dialog
 */
export declare const showConfirmDialogEffect: (message: string, title?: string) => Effect.Effect<boolean>;
/**
 * Effect wrapper for directory picker
 */
export declare const showDirectoryPickerEffect: (startPath?: string) => Effect.Effect<string | undefined>;
/**
 * Show dialog asking user to confirm before closing unsaved changes
 */
export declare const confirmCloseUnsaved: () => Effect.Effect<boolean>;
/**
 * Show dialog for overwrite confirmation
 */
export declare const confirmOverwrite: (filePath: string) => Effect.Effect<boolean>;
export default DialogServiceTag;
//# sourceMappingURL=DialogService.d.ts.map