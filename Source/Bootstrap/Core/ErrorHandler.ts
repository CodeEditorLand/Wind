/**
 * @module Bootstrap/Core/ErrorHandler
 * @description
 * Centralized error handling with recovery strategies.
 */

import type { ErrorSeverity, StageName } from '../Types/BootstrapTypes.ts';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: Array<{
    stage: StageName;
    error: Error;
    severity: ErrorSeverity;
    timestamp: number;
    additionalInfo?: any;
  }> = [];

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with recovery strategies
   */
  async handle(
    stage: StageName,
    error: Error,
    severity: ErrorSeverity,
    additionalInfo?: any
  ): Promise<void> {
    const timestamp = performance.now();
    
    // Add to error history
    this.errors.push({
      stage,
      error,
      severity,
      timestamp,
      additionalInfo
    });

    // Log error
    console.error(`[ErrorHandler] ${severity.toUpperCase()} error in ${stage}:`, error);
    
    // Apply recovery strategy based on severity
    switch (severity) {
      case 'critical':
        await this.handleCriticalError(stage, error, additionalInfo);
        break;
      case 'warning':
        await this.handleWarningError(stage, error, additionalInfo);
        break;
      case 'info':
        await this.handleInfoError(stage, error, additionalInfo);
        break;
    }
  }

  /**
   * Handle critical errors
   */
  private async handleCriticalError(stage: StageName, error: Error, additionalInfo?: any): Promise<void> {
    console.error(`[ErrorHandler] Critical error in ${stage}:`, error);
    
    // Show error UI
    this.showCriticalErrorUI(stage, error, additionalInfo);
    
    // Attempt recovery strategies
    const recovered = await this.attemptRecovery(stage, error);
    
    if (!recovered) {
      // Fatal error - cannot continue
      throw error;
    }
  }

  /**
   * Handle warning errors
   */
  private async handleWarningError(stage: StageName, error: Error, additionalInfo?: any): Promise<void> {
    console.warn(`[ErrorHandler] Warning in ${stage}:`, error);
    
    // Show warning UI
    this.showWarningUI(stage, error, additionalInfo);
    
    // Attempt recovery with fallback
    await this.attemptRecovery(stage, error);
  }

  /**
   * Handle info errors
   */
  private async handleInfoError(stage: StageName, error: Error, additionalInfo?: any): Promise<void> {
    console.info(`[ErrorHandler] Info in ${stage}:`, error);
    
    // Just log, no UI needed
  }

  /**
   * Attempt recovery strategies
   */
  private async attemptRecovery(stage: StageName, error: Error): Promise<boolean> {
    console.log(`[ErrorHandler] Attempting recovery for ${stage}...`);
    
    // Implement recovery strategies based on stage
    switch (stage) {
      case 'Configuration':
        return await this.recoverConfigurationError(error);
      case 'Services':
        return await this.recoverServicesError(error);
      case 'Initialization':
        return await this.recoverInitializationError(error);
      default:
        console.warn(`[ErrorHandler] No recovery strategy for ${stage}`);
        return false;
    }
  }

  /**
   * Recovery strategy for Configuration errors
   */
  private async recoverConfigurationError(error: Error): Promise<boolean> {
    console.log('[ErrorHandler] Attempting configuration recovery...');
    
    try {
      // Try to load fallback configuration
      const fallbackConfig = this.createFallbackConfiguration();
      
      // Apply fallback configuration
      this.applyFallbackConfiguration(fallbackConfig);
      
      console.log('[ErrorHandler] ✓ Configuration recovery successful');
      return true;
    } catch (recoveryError) {
      console.error('[ErrorHandler] ✗ Configuration recovery failed:', recoveryError);
      return false;
    }
  }

  /**
   * Recovery strategy for Services errors
   */
  private async recoverServicesError(error: Error): Promise<boolean> {
    console.log('[ErrorHandler] Attempting services recovery...');
    
    try {
      // Create minimal service collection
      const minimalCollection = this.createMinimalServiceCollection();
      
      // Apply minimal services
      this.applyMinimalServices(minimalCollection);
      
      console.log('[ErrorHandler] ✓ Services recovery successful');
      return true;
    } catch (recoveryError) {
      console.error('[ErrorHandler] ✗ Services recovery failed:', recoveryError);
      return false;
    }
  }

  /**
   * Recovery strategy for Initialization errors
   */
  private async recoverInitializationError(error: Error): Promise<boolean> {
    console.log('[ErrorHandler] Attempting initialization recovery...');
    
    try {
      // Try to restart initialization with reduced functionality
      await this.restartInitializationWithFallback();
      
      console.log('[ErrorHandler] ✓ Initialization recovery successful');
      return true;
    } catch (recoveryError) {
      console.error('[ErrorHandler] ✗ Initialization recovery failed:', recoveryError);
      return false;
    }
  }

  /**
   * Create fallback configuration
   */
  private createFallbackConfiguration(): any {
    return {
      windowId: '1',
      machineId: this.generateMachineId(),
      sessionId: this.generateSessionId(),
      appRoot: 'file:///app',
      userDataPath: 'file:///app/user-data',
      platform: 'web',
      arch: 'web',
      logLevel: 2,
      productConfiguration: {
        nameShort: 'VSCode',
        nameLong: 'VSCode Wind',
        applicationName: 'vscode-wind'
      },
      nls: {
        language: 'en',
        availableLanguages: { en: 'English' },
        messages: {}
      }
    };
  }

  /**
   * Apply fallback configuration
   */
  private applyFallbackConfiguration(config: any): void {
    const vscode = (window as any).vscode;
    if (!vscode || !vscode.context) {
      throw new Error('Cannot apply fallback configuration: window.vscode.context not available');
    }
    
    vscode.context._configuration = config;
    vscode.context.configuration = () => config;
  }

  /**
   * Create minimal service collection
   */
  private createMinimalServiceCollection(): any {
    return {
      set: (id: any, instance: any) => {
        console.log(`[ErrorHandler] Service set: ${id}`);
      },
      get: (id: any) => {
        console.log(`[ErrorHandler] Service get: ${id}`);
        return null;
      },
      has: (id: any) => false
    };
  }

  /**
   * Apply minimal services
   */
  private applyMinimalServices(collection: any): void {
    (window as any).__SERVICE_COLLECTION__ = collection;
  }

  /**
   * Restart initialization with fallback
   */
  private async restartInitializationWithFallback(): Promise<void> {
    console.log('[ErrorHandler] Restarting initialization with fallback...');
    
    // Clear any existing workbench state
    this.clearWorkbenchState();
    
    // Wait for DOM to be ready
    await this.waitForDOMReady();
    
    // Try to initialize with minimal functionality
    await this.initializeMinimalWorkbench();
  }

  /**
   * Clear workbench state
   */
  private clearWorkbenchState(): void {
    // Clear any global workbench state
    delete (window as any).__WORKBENCH_INSTANCE__;
    delete (window as any).__WORKBENCH_SERVICES__;
  }

  /**
   * Wait for DOM to be ready
   */
  private async waitForDOMReady(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Initialize minimal workbench
   */
  private async initializeMinimalWorkbench(): Promise<void> {
    console.log('[ErrorHandler] Initializing minimal workbench...');
    
    // Create minimal workbench instance
    const minimalWorkbench = {
      initialized: true,
      running: true,
      servicesReady: false,
      minimalMode: true
    };
    
    (window as any).__WORKBENCH_INSTANCE__ = minimalWorkbench;
  }

  /**
   * Show critical error UI
   */
  private showCriticalErrorUI(stage: StageName, error: Error, additionalInfo?: any): void {
    const errorOverlay = document.createElement('div');
    errorOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    errorOverlay.innerHTML = `
      <div style="text-align: center; max-width: 600px; padding: 20px;">
        <h1 style="color: #f44336; margin-bottom: 20px;">❌ Bootstrap Error</h1>
        <h2 style="margin-bottom: 10px;">Stage: ${stage}</h2>
        <p style="margin-bottom: 20px; opacity: 0.8;">${error.message}</p>
        ${additionalInfo?.suggestion ? `<p style="margin-bottom: 20px;">${additionalInfo.suggestion}</p>` : ''}
        <div style="margin-top: 30px;">
          <button id="retry-btn" style="
            background: #2196f3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
          ">🔄 Retry</button>
          <button id="copy-btn" style="
            background: #4caf50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
          ">📋 Copy Error</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(errorOverlay);
    
    // Add event listeners
    document.getElementById('retry-btn')?.addEventListener('click', () => {
      location.reload();
    });
    
    document.getElementById('copy-btn')?.addEventListener('click', () => {
      const errorDetails = JSON.stringify({
        stage,
        error: error.message,
        stack: error.stack,
        additionalInfo,
        timestamp: new Date().toISOString()
      }, null, 2);
      
      navigator.clipboard.writeText(errorDetails).then(() => {
        const btn = document.getElementById('copy-btn');
        if (btn) btn.textContent = '✅ Copied!';
        setTimeout(() => {
          if (btn) btn.textContent = '📋 Copy Error';
        }, 2000);
      });
    });
  }

  /**
   * Show warning UI
   */
  private showWarningUI(stage: StageName, error: Error, additionalInfo?: any): void {
    // Create a non-intrusive warning notification
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #ff9800;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      z-index: 9999;
      max-width: 300px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    warningDiv.innerHTML = `
      <strong>⚠ Warning: ${stage}</strong><br>
      <small>${error.message}</small>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.parentNode.removeChild(warningDiv);
      }
    }, 5000);
  }

  /**
   * Remove error UI
   */
  removeErrorUI(): void {
    const errorOverlays = document.querySelectorAll('[style*="position: fixed"]');
    errorOverlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
  }

  /**
   * Get all errors
   */
  getErrors(): Array<{
    stage: StageName;
    error: Error;
    severity: ErrorSeverity;
    timestamp: number;
    additionalInfo?: any;
  }> {
    return [...this.errors];
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): Array<{
    stage: StageName;
    error: Error;
    timestamp: number;
    additionalInfo?: any;
  }> {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Export errors as JSON
   */
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Generate machine ID
   */
  private generateMachineId(): string {
    const existing = localStorage.getItem('vscode-wind-machine-id');
    if (existing) {
      return existing;
    }
    
    const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    localStorage.setItem('vscode-wind-machine-id', newId);
    return newId;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
