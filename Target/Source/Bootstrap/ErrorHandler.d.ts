/**
 * @module ErrorHandler
 * @description
 * Centralized error handling with recovery strategies and reporting.
 */
import type { ErrorSeverity } from './Types.js';
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
}
export declare class ErrorHandler {
    private static instance;
    private errors;
    private recoveryStrategies;
    private constructor();
    static getInstance(): ErrorHandler;
    /**
     * Handle an error with optional recovery
     */
    handle(stage: string, error: Error, severity?: ErrorSeverity, additionalInfo?: any): Promise<boolean>;
    /**
     * Register a recovery strategy for a stage
     */
    registerRecoveryStrategy(stage: string, strategy: RecoveryStrategy): void;
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