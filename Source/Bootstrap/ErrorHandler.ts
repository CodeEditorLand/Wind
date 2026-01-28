/**
 * @module ErrorHandler
 * @description
 * Centralized error handling with recovery strategies and reporting.
 */

import type { ErrorSeverity, StageResult } from './Types.js';
import { StatusReporter } from './StatusReporter.js';

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

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorContext[] = [];
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with optional recovery
   */
  async handle(
    stage: string,
    error: Error,
    severity: ErrorSeverity = 'critical',
    additionalInfo?: any
  ): Promise<boolean> {
    const context: ErrorContext = {
      stage,
      error,
      severity,
      timestamp: Date.now(),
      additionalInfo
    };

    this.errors.push(context);

    // Log the error
    this.logError(context);

    // Report to status reporter
    const reporter = StatusReporter.getInstance();
    reporter.update({
      stage: stage as any,
      status: severity === 'critical' ? 'error' : 'warning',
      message: error.message,
      progress: 0,
      error
    });

    // Attempt recovery if possible
    const strategy = this.recoveryStrategies.get(stage);
    if (strategy && strategy.canRecover) {
      console.log(`[ErrorHandler] Attempting recovery for ${stage}...`);
      try {
        await strategy.action();
        console.log(`[ErrorHandler] ✓ Recovery successful for ${stage}`);
        return true;
      } catch (recoveryError) {
        console.error(`[ErrorHandler] ✗ Recovery failed for ${stage}:`, recoveryError);
        if (strategy.fallback) {
          console.log(`[ErrorHandler] Trying fallback for ${stage}...`);
          try {
            await strategy.fallback();
            console.log(`[ErrorHandler] ✓ Fallback successful for ${stage}`);
            return true;
          } catch (fallbackError) {
            console.error(`[ErrorHandler] ✗ Fallback failed for ${stage}:`, fallbackError);
          }
        }
      }
    }

    // Show error UI for critical errors
    if (severity === 'critical') {
      this.showErrorUI(context);
    }

    return false;
  }

  /**
   * Register a recovery strategy for a stage
   */
  registerRecoveryStrategy(stage: string, strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(stage, strategy);
  }

  /**
   * Log error to console and potentially to backend
   */
  private logError(context: ErrorContext): void {
    const { stage, error, severity, timestamp } = context;
    const time = new Date(timestamp).toISOString();

    switch (severity) {
      case 'critical':
        console.error(`%c[${time}] [${stage}] CRITICAL ERROR:`, 'color: #f44336; font-weight: bold', error);
        break;
      case 'warning':
        console.warn(`%c[${time}] [${stage}] WARNING:`, 'color: #ff9800; font-weight: bold', error);
        break;
      case 'info':
        console.info(`[${time}] [${stage}] INFO:`, error);
        break;
    }

    if (context.additionalInfo) {
      console.log('Additional info:', context.additionalInfo);
    }
  }

  /**
   * Show error UI in the page
   */
  private showErrorUI(context: ErrorContext): void {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'bootstrap-error-overlay';
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

    const errorBox = document.createElement('div');
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
      
      ${context.additionalInfo ? `
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
      ` : ''}
      
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
    const retryBtn = document.getElementById('bootstrap-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        console.log('[ErrorHandler] Retry requested by user');
        window.location.reload();
      });
    }

    const copyBtn = document.getElementById('bootstrap-copy-error-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const errorText = `
Stage: ${context.stage}
Severity: ${context.severity}
Error: ${context.error.message}
Stack: ${context.error.stack}
Additional Info: ${JSON.stringify(context.additionalInfo, null, 2)}
        `.trim();

        navigator.clipboard.writeText(errorText).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Error';
          }, 2000);
        });
      });
    }
  }

  /**
   * Remove error UI
   */
  removeErrorUI(): void {
    const errorDiv = document.getElementById('bootstrap-error-overlay');
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
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Get errors by stage
   */
  getErrorsByStage(stage: string): ErrorContext[] {
    return this.errors.filter(e => e.stage === stage);
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
    return this.errors.some(e => e.severity === 'critical');
  }
}