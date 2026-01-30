/**
 * @module Bootstrap/Core/ErrorHandler
 * @description
 * Centralized error handling with recovery strategies.
 */
import type { ErrorSeverity, StageName } from '../Types/Types.js';
export declare class ErrorHandler {
    private static instance;
    private errors;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): ErrorHandler;
    /**
     * Handle an error with recovery strategies
     */
    handle(stage: StageName, error: Error, severity: ErrorSeverity, additionalInfo?: any): Promise<void>;
    /**
     * Handle critical errors
     */
    private handleCriticalError;
    /**
     * Handle warning errors
     */
    private handleWarningError;
    /**
     * Handle info errors
     */
    private handleInfoError;
    /**
     * Attempt recovery strategies
     */
    private attemptRecovery;
    /**
     * Recovery strategy for Configuration errors
     */
    private recoverConfigurationError;
    /**
     * Recovery strategy for Services errors
     */
    private recoverServicesError;
    /**
     * Recovery strategy for Initialization errors
     */
    private recoverInitializationError;
    /**
     * Create fallback configuration
     */
    private createFallbackConfiguration;
    /**
     * Apply fallback configuration
     */
    private applyFallbackConfiguration;
    /**
     * Create minimal service collection
     */
    private createMinimalServiceCollection;
    /**
     * Apply minimal services
     */
    private applyMinimalServices;
    /**
     * Restart initialization with fallback
     */
    private restartInitializationWithFallback;
    /**
     * Clear workbench state
     */
    private clearWorkbenchState;
    /**
     * Wait for DOM to be ready
     */
    private waitForDOMReady;
    /**
     * Initialize minimal workbench
     */
    private initializeMinimalWorkbench;
    /**
     * Show critical error UI
     */
    private showCriticalErrorUI;
    /**
     * Show warning UI
     */
    private showWarningUI;
    /**
     * Remove error UI
     */
    removeErrorUI(): void;
    /**
     * Get all errors
     */
    getErrors(): Array<{
        stage: StageName;
        error: Error;
        severity: ErrorSeverity;
        timestamp: number;
        additionalInfo?: any;
    }>;
    /**
     * Get errors by severity
     */
    getErrorsBySeverity(severity: ErrorSeverity): Array<{
        stage: StageName;
        error: Error;
        timestamp: number;
        additionalInfo?: any;
    }>;
    /**
     * Export errors as JSON
     */
    exportErrors(): string;
    /**
     * Clear all errors
     */
    clearErrors(): void;
    /**
     * Generate machine ID
     */
    private generateMachineId;
    /**
     * Generate session ID
     */
    private generateSessionId;
}
//# sourceMappingURL=ErrorHandler.d.ts.map