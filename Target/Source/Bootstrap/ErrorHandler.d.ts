/**
 * @module ErrorHandler
 * @description
 * Centralized error handling with recovery strategies and reporting.
 *
 * This component provides comprehensive error management for the bootstrap process.
 * It categorizes errors, registers recovery strategies, manages error UI display,
 * tracks error history, and exports error data for diagnostics.
 *
 * Component Responsibilities:
 * - Categorize errors by severity (critical, warning, info)
 * - Register and execute recovery strategies for each stage
 * - Manage error UI display with detailed information
 * - Export error data for diagnostics
 * - Track error history and trends
 * - Execute recovery actions with fallback mechanisms
 * - Provide error context and additional information
 * - Support error filtering and querying
 * - Circuit breaker pattern for repeated failures
 * - Error UI with retry and copy functionality
 * - Error notification and alerting
 * - Error statistics and reporting
 * - Error history management with timestamps
 * - Error context preservation
 *
 * Architecture Overview:
 * ErrorHandler is a singleton that centralizes all error handling for the bootstrap
 * process. It maintains a registry of recovery strategies for different stages and
 * provides methods to handle errors with optional recovery attempts. The component
 * provides both UI-based and programmatic error reporting and supports comprehensive
 * error tracking and diagnostics.
 *
 * Microsoft VSCode Source References:
 * - src/vs/base/common/errors.ts - Error utilities and categorization
 * - src/vs/workbench/common/errors.ts - Workbench error handling
 * - src/vs/workbench/services/dialogs/common/dialogService.ts - Error dialogs
 * - src/vs/workbench/contrib/notifications/browser/notifications.ts - Notification system
 * - src/vs/platform/notification/common/notification.ts - Notification API
 * - src/vs/base/browser/ui/dialog/dialog.ts - Dialog UI patterns
 * - src/vs/base/browser/ui/modal/modal.ts - Modal UI patterns
 * - src/vs/platform/telemetry/common/errorTelemetry.ts - Error telemetry
 * - src/vs/base/common/errorMessage.ts - Error message formatting
 * - src/vs/base/common/strings.ts - String utilities for error messages
 * - src/vs/platform/product/common/productService.ts - Product info for errors
 * - src/vs/workbench/browser/parts/statusbar/statusbar.ts - Status error display
 * - src/vs/workbench/contrib/output/browser/output.ts - Error output
 * - src/vs/workbench/contrib/debug/common/debug.ts - Error debugging support
 * - src/vs/base/common/objects.ts - Error object utilities
 * - src/vs/platform/configuration/common/configuration.ts - Error configuration
 * - src/vs/platform/environment/common/environment.ts - Environment error context
 * - src/vs/platform/log/common/log.ts - Error logging
 * - src/vs/workbench/services/lifecycle/common/lifecycle.ts - Error recovery lifecycle
 * - src/vs/base/browser/browser.ts - Browser-specific error handling
 * - src/vs/base/common/platform.ts - Platform-specific error handling
 * - src/vs/base/common/network.ts - Network error handling
 * - src/vs/workbench/services/files/common/files.ts - File error handling
 * - src/vs/workbench/services/extensions/common/extensions.ts - Extension error handling
 * - src/vs/workbench/services/editor/common/editorService.ts - Editor error handling
 * - src/vs/base/common/arrays.ts - Error array utilities
 * - src/vs/base/common/date.ts - Error timestamp utilities
 * - src/vs/platform/opener/common/opener.ts - Error opener utilities
 * - src/vs/base/common/async.ts - Async error handling
 * - src/vs/base/common/cancellation.ts - Cancellation error handling
 *
 * TODO:
 * - Implement automatic error reporting to remote server
 * - Add error stack trace beautification
 * - Implement error grouping and deduplication
 * - Add error severity escalation based on frequency
 * - Implement error recovery success rate tracking
 * - Add error prediction and prevention
 * - Implement error context enrichment
 * - Add error search and filtering capabilities
 * - Implement error trend analysis and visualization
 * - Add error export in multiple formats (JSON, CSV, XML)
 * - Implement error notification preferences
 * - Add error UI customization (theme, position, style)
 * - Implement error recovery strategy priorities
 * - Add error recovery timeout handling
 * - Implement error recovery validation
 * - Add error recovery monitoring
 * - Implement error recovery rollback
 * - Add error recovery logging
 * - Implement error recovery analytics
 * - Add error recovery performance tracking
 */
import type { ErrorSeverity } from "./Types.js";
export interface ErrorContext {
    stage: string;
    error: Error;
    severity: ErrorSeverity;
    timestamp: number;
    additionalInfo?: any;
}
export interface RecoveryStrategy {
    canRecover: boolean;
    action: () => Promise<void>;
    fallback?: () => Promise<void>;
    priority?: number;
    maxAttempts?: number;
}
export interface ErrorHistory {
    errors: ErrorContext[];
    summary: {
        total: number;
        byStage: Map<string, number>;
        bySeverity: Map<ErrorSeverity, number>;
        timeRange: {
            start: number;
            end: number;
        };
    };
}
export declare class ErrorHandler {
    private static instance;
    private errors;
    private recoveryStrategies;
    private errorUIVisible;
    private circuitBreakerFailures;
    private readonly CIRCUIT_BREAKER_THRESHOLD;
    private constructor();
    /**
     * Get the ErrorHandler singleton instance
     */
    static getInstance(): ErrorHandler;
    /**
     * Categorize error by analyzing its content and context
     * @param error The error object
     * @param stage The stage where error occurred
     * @returns Categorized error severity
     */
    CategorizeError(error: Error, stage: string): ErrorSeverity;
    /**
     * Execute recovery strategy for a stage
     * @param stage The stage name
     * @param error The error that occurred
     * @returns Recovery success status
     */
    ExecuteRecovery(stage: string, error: Error): Promise<boolean>;
    /**
     * Manage error UI visibility
     * @param visible Whether the error UI should be visible
     */
    ManageErrorUI(visible: boolean): void;
    /**
     * Export error data for diagnostics
     * @param format Export format (json, csv, txt)
     * @returns Exported error data as string
     */
    ExportErrors(format?: "json" | "csv" | "txt"): string;
    /**
     * Convert errors to CSV format
     * @returns CSV string of errors
     */
    private errorsToCSV;
    /**
     * Convert errors to text format
     * @returns Text string of errors
     */
    private errorsToText;
    /**
     * Track error history with summary statistics
     * @returns Error history with summary
     */
    TrackErrorHistory(): ErrorHistory;
    /**
     * Handle an error with optional recovery
     */
    handle(stage: string, error: Error, severity?: ErrorSeverity, additionalInfo?: any): Promise<boolean>;
    /**
     * Check if circuit breaker should be triggered
     * @param context The error context
     * @returns Whether to trigger circuit breaker
     */
    private shouldTriggerCircuitBreaker;
    /**
     * Open circuit breaker to stop error handling
     */
    private openCircuitBreaker;
    /**
     * Close circuit breaker and reset state
     */
    private closeCircuitBreaker;
    /**
     * Log error to console and potentially to backend
     */
    private logError;
    /**
     * Show error UI in the page
     */
    private showErrorUI;
    /**
     * Remove error UI
     */
    removeErrorUI(): void;
    /**
     * Get all errors
     */
    getErrors(): ErrorContext[];
    /**
     * Get errors by severity
     */
    getErrorsBySeverity(severity: ErrorSeverity): ErrorContext[];
    /**
     * Get errors by stage
     */
    getErrorsByStage(stage: string): ErrorContext[];
    /**
     * Clear all errors
     */
    clearErrors(): void;
    /**
     * Export errors as JSON
     */
    exportErrors(): string;
    /**
     * Check if there are critical errors
     */
    hasCriticalErrors(): boolean;
}
//# sourceMappingURL=ErrorHandler.d.ts.map