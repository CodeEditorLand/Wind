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

import { StatusReporter } from "./StatusReporter.js";
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
		timeRange: { start: number; end: number };
	};
}

export class ErrorHandler {
	private static instance: ErrorHandler;
	private errors: ErrorContext[] = [];
	private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
	private errorUIVisible: boolean = false;
	private circuitBreakerFailures: number = 0;
	private readonly CIRCUIT_BREAKER_THRESHOLD = 5;

	private constructor() {}

	/**
	 * Get the ErrorHandler singleton instance
	 */
	static getInstance(): ErrorHandler {
		if (!ErrorHandler.instance) {
			ErrorHandler.instance = new ErrorHandler();
		}
		return ErrorHandler.instance;
	}

	/**
	 * Categorize error by analyzing its content and context
	 * @param error The error object
	 * @param stage The stage where error occurred
	 * @returns Categorized error severity
	 */
	CategorizeError(error: Error, stage: string): ErrorSeverity {
		const errorMessage = error.message.toLowerCase();
		const errorName = error.name.toLowerCase();

		// Critical errors that prevent bootstrap from completing
		if (
			errorMessage.includes("timeout") ||
			errorMessage.includes("cannot read") ||
			errorMessage.includes("cannot access") ||
			errorMessage.includes("not defined") ||
			errorName.includes("referenceerror") ||
			(errorName.includes("typeerror") &&
				errorMessage.includes("is not a"))
		) {
			return "critical";
		}

		// Warnings that don't prevent bootstrapping
		if (
			errorMessage.includes("deprecated") ||
			errorMessage.includes("warning") ||
			errorMessage.includes("slow") ||
			errorMessage.includes("performance")
		) {
			return "warning";
		}

		// Default to critical for bootstrap errors
		return "critical";
	}

	/**
	 * Register recovery strategy for a stage
	 * @param stage The stage name
	 * @param strategy The recovery strategy
	 */
	RegisterRecoveryStrategy(stage: string, strategy: RecoveryStrategy): void {
		this.recoveryStrategies.set(stage, strategy);
		console.log(`[ErrorHandler] Recovery strategy registered for ${stage}`);
	}

	/**
	 * Execute recovery strategy for a stage
	 * @param stage The stage name
	 * @param error The error that occurred
	 * @returns Recovery success status
	 */
	async ExecuteRecovery(stage: string, error: Error): Promise<boolean> {
		const strategy = this.recoveryStrategies.get(stage);
		if (!strategy || !strategy.canRecover) {
			console.log(
				`[ErrorHandler] No recovery strategy available for ${stage}`,
			);
			return false;
		}

		console.log(`[ErrorHandler] Attempting recovery for ${stage}...`);

		const maxAttempts = strategy.maxAttempts || 1;
		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				await strategy.action();
				console.log(
					`[ErrorHandler] ✓ Recovery successful for ${stage} (attempt ${attempt})`,
				);
				return true;
			} catch (recoveryError) {
				console.error(
					`[ErrorHandler] ✗ Recovery attempt ${attempt} failed for ${stage}:`,
					recoveryError,
				);

				if (strategy.fallback && attempt === maxAttempts) {
					console.log(
						`[ErrorHandler] Trying fallback for ${stage}...`,
					);
					try {
						await strategy.fallback();
						console.log(
							`[ErrorHandler] ✓ Fallback successful for ${stage}`,
						);
						return true;
					} catch (fallbackError) {
						console.error(
							`[ErrorHandler] ✗ Fallback failed for ${stage}:`,
							fallbackError,
						);
					}
				}
			}
		}

		return false;
	}

	/**
	 * Manage error UI visibility
	 * @param visible Whether the error UI should be visible
	 */
	ManageErrorUI(visible: boolean): void {
		if (visible === this.errorUIVisible) return;

		const errorDiv = document.getElementById("bootstrap-error-overlay");
		if (errorDiv) {
			errorDiv.style.display = visible ? "flex" : "none";
			this.errorUIVisible = visible;
		}
	}

	/**
	 * Export error data for diagnostics
	 * @param format Export format (json, csv, txt)
	 * @returns Exported error data as string
	 */
	ExportErrors(format: "json" | "csv" | "txt" = "json"): string {
		switch (format) {
			case "json":
				return JSON.stringify(this.errors, null, 2);
			case "csv":
				return this.errorsToCSV();
			case "txt":
				return this.errorsToText();
			default:
				return JSON.stringify(this.errors, null, 2);
		}
	}

	/**
	 * Convert errors to CSV format
	 * @returns CSV string of errors
	 */
	private errorsToCSV(): string {
		const headers = ["Stage", "Severity", "Timestamp", "Error", "Stack"];
		const rows = this.errors.map((ctx) => [
			ctx.stage,
			ctx.severity,
			new Date(ctx.timestamp).toISOString(),
			`"${ctx.error.message.replace(/"/g, '""')}"`,
			`"${(ctx.error.stack || "").replace(/"/g, '""')}"`,
		]);

		return [headers.join(","), ...rows.map((row) => row.join(","))].join(
			"\n",
		);
	}

	/**
	 * Convert errors to text format
	 * @returns Text string of errors
	 */
	private errorsToText(): string {
		return this.errors
			.map(
				(ctx, index) => `
Error ${index + 1}:
  Stage: ${ctx.stage}
  Severity: ${ctx.severity}
  Timestamp: ${new Date(ctx.timestamp).toISOString()}
  Error: ${ctx.error.message}
  Stack: ${ctx.error.stack || "No stack trace"}
  ${ctx.additionalInfo ? `Additional Info: ${JSON.stringify(ctx.additionalInfo, null, 2)}` : ""}
`,
			)
			.join("\n" + "-".repeat(60) + "\n");
	}

	/**
	 * Track error history with summary statistics
	 * @returns Error history with summary
	 */
	TrackErrorHistory(): ErrorHistory {
		const byStage = new Map<string, number>();
		const bySeverity = new Map<ErrorSeverity, number>();

		this.errors.forEach((ctx) => {
			byStage.set(ctx.stage, (byStage.get(ctx.stage) || 0) + 1);
			bySeverity.set(
				ctx.severity,
				(bySeverity.get(ctx.severity) || 0) + 1,
			);
		});

		const timestamps = this.errors.map((ctx) => ctx.timestamp);
		const timeRange =
			timestamps.length > 0
				? {
						start: Math.min(...timestamps),
						end: Math.max(...timestamps),
					}
				: { start: Date.now(), end: Date.now() };

		return {
			errors: [...this.errors],
			summary: {
				total: this.errors.length,
				byStage,
				bySeverity,
				timeRange,
			},
		};
	}

	/**
	 * Handle an error with optional recovery
	 */
	async handle(
		stage: string,
		error: Error,
		severity: ErrorSeverity = "critical",
		additionalInfo?: any,
	): Promise<boolean> {
		// Auto-categorize error if not provided
		const errorSeverity = severity || this.CategorizeError(error, stage);

		const context: ErrorContext = {
			stage,
			error,
			severity: errorSeverity,
			timestamp: Date.now(),
			additionalInfo,
		};

		this.errors.push(context);

		// Check circuit breaker for repeated errors
		if (this.shouldTriggerCircuitBreaker(context)) {
			this.openCircuitBreaker();
			console.error(
				"[ErrorHandler] Circuit breaker triggered - stopping error handling",
			);
			return false;
		}

		// Log the error
		this.logError(context);

		// Report to status reporter
		const reporter = StatusReporter.getInstance();
		reporter.update({
			stage: stage as any,
			status: errorSeverity === "critical" ? "error" : "warning",
			message: error.message,
			progress: 0,
			error,
		});

		// Attempt recovery if possible
		const strategy = this.recoveryStrategies.get(stage);
		if (strategy && strategy.canRecover) {
			console.log(`[ErrorHandler] Attempting recovery for ${stage}...`);
			const recovered = await this.ExecuteRecovery(stage, error);
			if (recovered) {
				return true;
			}
		}

		// Show error UI for critical errors
		if (errorSeverity === "critical") {
			this.showErrorUI(context);
		}

		return false;
	}

	/**
	 * Register a recovery strategy for a stage
	 */
	RegisterRecoveryStrategy(stage: string, strategy: RecoveryStrategy): void {
		this.recoveryStrategies.set(stage, strategy);
	}

	/**
	 * Check if circuit breaker should be triggered
	 * @param context The error context
	 * @returns Whether to trigger circuit breaker
	 */
	private shouldTriggerCircuitBreaker(context: ErrorContext): boolean {
		if (context.severity !== "critical") {
			return false;
		}

		this.circuitBreakerFailures++;

		// Check repeated errors in short time window
		const recentErrors = this.errors.filter(
			(e) =>
				e.stage === context.stage &&
				e.severity === "critical" &&
				e.timestamp > Date.now() - 60000, // Last 60 seconds
		);

		return recentErrors.length >= this.CIRCUIT_BREAKER_THRESHOLD;
	}

	/**
	 * Open circuit breaker to stop error handling
	 */
	private openCircuitBreaker(): void {
		this.circuitBreakerOpen = true;
		console.error(
			`[ErrorHandler] Circuit breaker opened after ${this.circuitBreakerFailures} failures`,
		);

		// Auto-reset after 5 minutes
		setTimeout(() => {
			this.closeCircuitBreaker();
		}, 300000);
	}

	/**
	 * Close circuit breaker and reset state
	 */
	private closeCircuitBreaker(): void {
		this.circuitBreakerOpen = false;
		this.circuitBreakerFailures = 0;
		console.log("[ErrorHandler] Circuit breaker closed");
	}

	/**
	 * Log error to console and potentially to backend
	 */
	private logError(context: ErrorContext): void {
		const { stage, error, severity, timestamp } = context;
		const time = new Date(timestamp).toISOString();

		switch (severity) {
			case "critical":
				console.error(
					`%c[${time}] [${stage}] CRITICAL ERROR:`,
					"color: #f44336; font-weight: bold",
					error,
				);
				break;
			case "warning":
				console.warn(
					`%c[${time}] [${stage}] WARNING:`,
					"color: #ff9800; font-weight: bold",
					error,
				);
				break;
			case "info":
				console.info(`[${time}] [${stage}] INFO:`, error);
				break;
		}

		if (context.additionalInfo) {
			console.log("Additional info:", context.additionalInfo);
		}
	}

	/**
	 * Show error UI in the page
	 */
	private showErrorUI(context: ErrorContext): void {
		const errorDiv = document.createElement("div");
		errorDiv.id = "bootstrap-error-overlay";
		errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

		const errorBox = document.createElement("div");
		errorBox.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 600px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    `;

		errorBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <span style="font-size: 32px;">❌</span>
        <h2 style="margin: 0; color: #c62828;">Bootstrap Error</h2>
      </div>
      
      <div style="margin-bottom: 16px;">
        <strong>Stage:</strong> ${context.stage}
      </div>
      
      <div style="margin-bottom: 16px;">
        <strong>Severity:</strong> ${context.severity.toUpperCase()}
      </div>
      
      <div style="margin-bottom: 16px;">
        <strong>Error:</strong>
        <pre style="
          background: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          overflow: auto;
          max-height: 200px;
          font-size: 12px;
          margin: 8px 0 0 0;
        ">${context.error.stack || context.error.message}</pre>
      </div>
      
      ${
			context.additionalInfo
				? `
        <div style="margin-bottom: 16px;">
          <strong>Additional Info:</strong>
          <pre style="
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            overflow: auto;
            max-height: 150px;
            font-size: 11px;
            margin: 8px 0 0 0;
          ">${JSON.stringify(context.additionalInfo, null, 2)}</pre>
        </div>
      `
				: ""
		}
      
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button id="bootstrap-retry-btn" style="
          flex: 1;
          padding: 12px 24px;
          background: #007acc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        ">Retry</button>
        <button id="bootstrap-copy-error-btn" style="
          flex: 1;
          padding: 12px 24px;
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Copy Error</button>
      </div>
      
      <div style="margin-top: 16px; font-size: 12px; color: #666;">
        💡 Tip: Check the browser console for more details
      </div>
    `;

		errorDiv.appendChild(errorBox);
		document.body.appendChild(errorDiv);

		// Add event listeners
		const retryBtn = document.getElementById("bootstrap-retry-btn");
		if (retryBtn) {
			retryBtn.addEventListener("click", () => {
				console.log("[ErrorHandler] Retry requested by user");
				window.location.reload();
			});
		}

		const copyBtn = document.getElementById("bootstrap-copy-error-btn");
		if (copyBtn) {
			copyBtn.addEventListener("click", () => {
				const errorText = `
Stage: ${context.stage}
Severity: ${context.severity}
Error: ${context.error.message}
Stack: ${context.error.stack}
Additional Info: ${JSON.stringify(context.additionalInfo, null, 2)}
        `.trim();

				navigator.clipboard.writeText(errorText).then(() => {
					copyBtn.textContent = "Copied!";
					setTimeout(() => {
						copyBtn.textContent = "Copy Error";
					}, 2000);
				});
			});
		}
	}

	/**
	 * Remove error UI
	 */
	removeErrorUI(): void {
		const errorDiv = document.getElementById("bootstrap-error-overlay");
		if (errorDiv) {
			errorDiv.remove();
		}
	}

	/**
	 * Get all errors
	 */
	getErrors(): ErrorContext[] {
		return [...this.errors];
	}

	/**
	 * Get errors by severity
	 */
	getErrorsBySeverity(severity: ErrorSeverity): ErrorContext[] {
		return this.errors.filter((e) => e.severity === severity);
	}

	/**
	 * Get errors by stage
	 */
	getErrorsByStage(stage: string): ErrorContext[] {
		return this.errors.filter((e) => e.stage === stage);
	}

	/**
	 * Clear all errors
	 */
	clearErrors(): void {
		this.errors = [];
	}

	/**
	 * Export errors as JSON
	 */
	exportErrors(): string {
		return JSON.stringify(this.errors, null, 2);
	}

	/**
	 * Check if there are critical errors
	 */
	hasCriticalErrors(): boolean {
		return this.errors.some((e) => e.severity === "critical");
	}
}
