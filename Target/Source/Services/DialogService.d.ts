/**
 * @module DialogService
 * @description
 * Advanced dialog service implementation based on Microsoft patterns with Tauri integration.
 * Provides comprehensive file dialog functionality with advanced error handling and performance monitoring.
 *
 * Architecture:
 * - Microsoft-inspired service patterns with dependency injection
 * - Tauri-native dialog integration
 * - Advanced error handling with graceful degradation
 * - Performance monitoring and optimization
 * - Comprehensive type safety
 *
 * Microsoft Source Reference: `vs/platform/dialogs/common/dialogs.ts`
 * TODO: Complete Microsoft pattern implementation
 * TODO: Add comprehensive error handling
 * TODO: Implement performance monitoring
 */
import { Effect, Layer } from "effect";
interface DialogServiceInterface {
    /**
     * Shows a native file open dialog to the user.
     * Microsoft Pattern: showOpenDialog with comprehensive options
     */
    readonly ShowOpenDialog: (options?: OpenDialogOptions) => Effect.Effect<readonly Uri[] | undefined, DialogProblem>;
    /**
     * Shows a native file save dialog to the user.
     * Microsoft Pattern: showSaveDialog with comprehensive options
     */
    readonly ShowSaveDialog: (options?: SaveDialogOptions) => Effect.Effect<Uri | undefined, DialogProblem>;
    /**
     * Shows a message dialog to the user.
     * Microsoft Pattern: showMessageBox with comprehensive options
     */
    readonly ShowMessageDialog: (options: MessageBoxOptions) => Effect.Effect<MessageBoxResult, DialogProblem>;
    /**
     * Shows an input dialog to the user.
     * Microsoft Pattern: showInputBox with comprehensive options
     */
    readonly ShowInputDialog: (options: InputDialogOptions) => Effect.Effect<string | undefined, DialogProblem>;
    /**
     * Shows a confirmation dialog to the user.
     * Microsoft Pattern: showConfirmationDialog
     */
    readonly ShowConfirmationDialog: (options: ConfirmationDialogOptions) => Effect.Effect<ConfirmationResult, DialogProblem>;
}
interface OpenDialogOptions {
    title?: string;
    defaultPath?: string;
    filters?: FileFilter[];
    canSelectFiles?: boolean;
    canSelectFolders?: boolean;
    canSelectMany?: boolean;
    showHiddenFiles?: boolean;
    openLabel?: string;
    canSelectManyMessage?: string;
    defaultUri?: Uri;
}
interface SaveDialogOptions {
    title?: string;
    defaultPath?: string;
    filters?: FileFilter[];
    showHiddenFiles?: boolean;
    saveLabel?: string;
    defaultUri?: Uri;
}
interface ConfirmationDialogOptions {
    type?: 'info' | 'warning' | 'error' | 'question';
    title?: string;
    message: string;
    detail?: string;
    primaryButton?: string;
    secondaryButton?: string;
    checkboxLabel?: string;
    checkboxChecked?: boolean;
}
interface ConfirmationResult {
    confirmed: boolean;
    checkboxChecked?: boolean;
}
interface MessageBoxOptions {
    type?: 'info' | 'warning' | 'error' | 'question';
    title?: string;
    message: string;
    detail?: string;
    buttons?: string[];
    defaultButton?: number;
    cancelButton?: number;
    checkboxLabel?: string;
    checkboxChecked?: boolean;
}
interface InputDialogOptions {
    title?: string;
    prompt?: string;
    value?: string;
    password?: boolean;
    placeHolder?: string;
    validateInput?: (value: string) => string | undefined;
}
interface FileFilter {
    name: string;
    extensions: string[];
}
interface Uri {
    fsPath: string;
    toString(): string;
}
interface MessageBoxResult {
    response: number;
    checkboxChecked?: boolean;
}
declare class DialogProblem extends Error {
    readonly context: string;
    readonly cause?: Error | undefined;
    readonly recoverable: boolean;
    readonly suggestion?: string | undefined;
    constructor(context: string, cause?: Error | undefined, recoverable?: boolean, suggestion?: string | undefined);
    static CreateConnectionError(cause: Error): DialogProblem;
    static CreatePermissionError(cause: Error): DialogProblem;
    static CreateValidationError(message: string): DialogProblem;
}
declare const DialogService_base: Effect.Service.Class<DialogServiceInterface, "Service/Dialog", {
    readonly effect: Effect.Effect<{
        ShowOpenDialog: (options?: OpenDialogOptions) => Effect.Effect<Uri[], DialogProblem, never>;
        ShowSaveDialog: (options?: SaveDialogOptions) => Effect.Effect<Uri | undefined, DialogProblem, never>;
        ShowMessageDialog: (options: MessageBoxOptions) => Effect.Effect<MessageBoxResult, DialogProblem, never>;
        ShowInputDialog: (options: InputDialogOptions) => Effect.Effect<string | undefined, DialogProblem, never>;
        ShowConfirmationDialog: (options: ConfirmationDialogOptions) => Effect.Effect<unknown, DialogProblem, never>;
    }, never, never>;
}>;
declare class DialogService extends DialogService_base {
}
export declare const ProvideDialog: Layer.Layer<DialogService, never, never>;
export declare const DialogServiceTag: typeof DialogService;
export declare class DialogErrorRecovery {
    static recoverFromError(error: DialogProblem): Promise<boolean>;
    private static recoverFromConnectionError;
    private static recoverFromPermissionError;
    private static recoverFromValidationError;
}
export declare class DialogPerformanceMonitor {
    private static metrics;
    static trackOperation(operation: string, startTime: number): void;
    static getMetrics(): {
        openDialogTime: number;
        saveDialogTime: number;
        messageDialogTime: number;
        inputDialogTime: number;
        errorRate: number;
        successRate: number;
    };
}
export default DialogService;
//# sourceMappingURL=DialogService.d.ts.map