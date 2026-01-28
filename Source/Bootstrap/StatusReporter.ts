/**
 * @module StatusReporter
 * @description
 * Provides real-time visual feedback during bootstrap process.
 */

import type { StatusUpdate, StageResult, BootstrapConfig } from './Types.js';

export class StatusReporter {
  private static instance: StatusReporter;
  private config: BootstrapConfig;
  private statusElement: HTMLElement | null = null;
  private logElement: HTMLElement | null = null;
  private progressBarElement: HTMLElement | null = null;
  private updates: StatusUpdate[] = [];
  private startTime: number = 0;

  private constructor(config: BootstrapConfig) {
    this.config = config;
  }

  static initialize(config: BootstrapConfig): StatusReporter {
    if (!StatusReporter.instance) {
      StatusReporter.instance = new StatusReporter(config);
    }
    return StatusReporter.instance;
  }

  static getInstance(): StatusReporter {
    if (!StatusReporter.instance) {
      throw new Error('StatusReporter not initialized. Call initialize() first.');
    }
    return StatusReporter.instance;
  }

  /**
   * Create the status UI overlay
   */
  createUI(): void {
    if (!this.config.showStatusUI) {
      return;
    }

    // Create main container
    const container = document.createElement('div');
    container.id = 'bootstrap-status-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      background: rgba(255, 255, 255, 0.98);
      border: 2px solid #007acc;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 99999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 13px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      background: #007acc;
      color: white;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span>🚀 Bootstrap Progress</span>
      <button id="bootstrap-toggle-logs" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      ">Toggle Logs</button>
    `;

    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    `;

    const progressBar = document.createElement('div');
    progressBar.id = 'bootstrap-progress-bar';
    progressBar.style.cssText = `
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    `;

    const progressFill = document.createElement('div');
    progressFill.id = 'bootstrap-progress-fill';
    progressFill.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #007acc, #00a8ff);
      transition: width 0.3s ease;
    `;

    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);

    // Create stage list
    const stageList = document.createElement('div');
    stageList.id = 'bootstrap-stage-list';
    stageList.style.cssText = `
      padding: 12px 16px;
      overflow-y: auto;
      flex: 1;
    `;

    // Create log panel (hidden by default)
    const logPanel = document.createElement('div');
    logPanel.id = 'bootstrap-log-panel';
    logPanel.style.cssText = `
      display: none;
      padding: 12px 16px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 11px;
      max-height: 200px;
      overflow-y: auto;
      border-top: 1px solid #e0e0e0;
    `;

    // Assemble container
    container.appendChild(header);
    container.appendChild(progressContainer);
    container.appendChild(stageList);
    container.appendChild(logPanel);

    // Add to DOM
    document.body.appendChild(container);
    this.statusElement = container;
    this.logElement = logPanel;
    this.progressBarElement = progressFill;

    // Add toggle functionality
    const toggleButton = document.getElementById('bootstrap-toggle-logs');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        const isHidden = logPanel.style.display === 'none';
        logPanel.style.display = isHidden ? 'block' : 'none';
        toggleButton.textContent = isHidden ? 'Hide Logs' : 'Show Logs';
      });
    }

    this.startTime = performance.now();
  }

  /**
   * Update status for a stage
   */
  update(update: StatusUpdate): void {
    this.updates.push(update);

    if (!this.config.showStatusUI || !this.statusElement) {
      return;
    }

    // Update progress bar
    if (this.progressBarElement) {
      this.progressBarElement.style.width = `${update.progress}%`;
    }

    // Update stage list
    this.updateStageList(update);

    // Add to log
    if (this.config.verboseLogging && this.logElement) {
      this.addLogEntry(update);
    }

    // Log to console
    this.logToConsole(update);
  }

  /**
   * Update the stage list in the UI
   */
  private updateStageList(update: StatusUpdate): void {
    const stageList = document.getElementById('bootstrap-stage-list');
    if (!stageList) return;

    let stageElement = document.getElementById(`stage-${update.stage}`);
    
    if (!stageElement) {
      stageElement = document.createElement('div');
      stageElement.id = `stage-${update.stage}`;
      stageElement.style.cssText = `
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      stageList.appendChild(stageElement);
    }

    const icon = this.getStatusIcon(update.status);
    const color = this.getStatusColor(update.status);

    stageElement.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <span style="flex: 1; font-weight: 500;">${update.stage}</span>
      <span style="color: ${color}; font-size: 11px;">${update.status}</span>
      ${update.duration ? `<span style="color: #666; font-size: 11px;">${update.duration.toFixed(0)}ms</span>` : ''}
    `;

    if (update.message) {
      const messageElement = document.createElement('div');
      messageElement.style.cssText = `
        font-size: 11px;
        color: #666;
        margin-left: 24px;
        margin-top: 4px;
      `;
      messageElement.textContent = update.message;
      stageElement.appendChild(messageElement);
    }

    if (update.error) {
      const errorElement = document.createElement('div');
      errorElement.style.cssText = `
        font-size: 11px;
        color: #c62828;
        margin-left: 24px;
        margin-top: 4px;
        padding: 4px;
        background: rgba(198, 40, 40, 0.1);
        border-radius: 4px;
      `;
      errorElement.textContent = update.error.message;
      stageElement.appendChild(errorElement);
    }
  }

  /**
   * Add entry to log panel
   */
  private addLogEntry(update: StatusUpdate): void {
    if (!this.logElement) return;

    const timestamp = new Date().toISOString();
    const entry = document.createElement('div');
    entry.style.cssText = `
      padding: 4px 0;
      border-bottom: 1px solid #333;
      font-family: 'Consolas', 'Monaco', monospace;
    `;

    const color = this.getStatusColor(update.status);
    entry.innerHTML = `
      <span style="color: #666;">[${timestamp}]</span>
      <span style="color: ${color}; font-weight: bold;">${update.stage}:</span>
      <span>${update.message}</span>
      ${update.duration ? `<span style="color: #888;">(${update.duration.toFixed(0)}ms)</span>` : ''}
    `;

    this.logElement.appendChild(entry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  /**
   * Log to console
   */
  private logToConsole(update: StatusUpdate): void {
    const prefix = `[Bootstrap] [${update.stage}]`;
    
    switch (update.status) {
      case 'running':
        console.log(`${prefix} ${update.message}`);
        break;
      case 'success':
        console.log(`%c${prefix} ✓ ${update.message}`, 'color: #4caf50; font-weight: bold');
        break;
      case 'error':
        console.error(`%c${prefix} ✗ ${update.message}`, 'color: #f44336; font-weight: bold');
        if (update.error) {
          console.error(update.error);
        }
        break;
      case 'warning':
        console.warn(`%c${prefix} ⚠ ${update.message}`, 'color: #ff9800; font-weight: bold');
        break;
    }
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  }

  /**
   * Get status color
   */
  private getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return '#999';
      case 'running': return '#007acc';
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#666';
    }
  }

  /**
   * Update final result
   */
  finalize(result: any): void {
    if (!this.config.showStatusUI || !this.statusElement) {
      return;
    }

    const totalDuration = performance.now() - this.startTime;
    
    const summary = document.createElement('div');
    summary.style.cssText = `
      padding: 12px 16px;
      background: ${result.success ? '#e8f5e9' : '#ffebee'};
      border-top: 2px solid ${result.success ? '#4caf50' : '#f44336'};
      font-weight: 600;
    `;
    
    summary.innerHTML = `
      <div style="color: ${result.success ? '#2e7d32' : '#c62828'};">
        ${result.success ? '✅ Bootstrap Complete' : '❌ Bootstrap Failed'}
      </div>
      <div style="font-size: 11px; color: #666; margin-top: 4px;">
        Total duration: ${totalDuration.toFixed(0)}ms
      </div>
    `;

    this.statusElement.appendChild(summary);
  }

  /**
   * Remove the status UI
   */
  removeUI(): void {
    if (this.statusElement) {
      this.statusElement.remove();
      this.statusElement = null;
    }
  }

  /**
   * Get all updates
   */
  getUpdates(): StatusUpdate[] {
    return [...this.updates];
  }

  /**
   * Export updates as JSON
   */
  exportUpdates(): string {
    return JSON.stringify(this.updates, null, 2);
  }
}