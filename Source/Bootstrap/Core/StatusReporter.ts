/**
 * @module Bootstrap/Core/StatusReporter
 * @description
 * Real-time visual feedback system for bootstrap process.
 */

import type { StatusUpdate, BootstrapResult } from '../Types/Types.js';

export class StatusReporter {
  private static instance: StatusReporter;
  private updates: StatusUpdate[] = [];
  private uiContainer: HTMLElement | null = null;
  private isUIEnabled: boolean = true;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): StatusReporter {
    if (!StatusReporter.instance) {
      StatusReporter.instance = new StatusReporter();
    }
    return StatusReporter.instance;
  }

  /**
   * Initialize with configuration
   */
  static initialize(config: { showStatusUI: boolean }): StatusReporter {
    const instance = StatusReporter.getInstance();
    instance.isUIEnabled = config.showStatusUI;
    return instance;
  }

  /**
   * Create status UI
   */
  createUI(): void {
    if (!this.isUIEnabled) {
      console.log('[StatusReporter] Status UI disabled by configuration');
      return;
    }

    if (this.uiContainer) {
      console.warn('[StatusReporter] UI already created');
      return;
    }

    console.log('[StatusReporter] Creating status UI...');

    // Create container
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      z-index: 9999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow-y: auto;
    `;

    // Create content structure
    this.uiContainer.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; margin-bottom: 30px;">🚀 Wind Bootstrap</h1>
        
        <!-- Progress Bar -->
        <div style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Overall Progress</span>
            <span id="progress-percent">0%</span>
          </div>
          <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
            <div id="progress-bar" style="background: #2196f3; height: 100%; width: 0%; transition: width 0.3s;"></div>
          </div>
        </div>

        <!-- Stage List -->
        <div style="margin-bottom: 30px;">
          <h2 style="margin-bottom: 15px;">Bootstrap Stages</h2>
          <div id="stage-list" style="display: grid; gap: 10px;"></div>
        </div>

        <!-- Performance Metrics -->
        <div style="margin-bottom: 30px;">
          <h2 style="margin-bottom: 15px;">Performance Metrics</h2>
          <div id="metrics" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;"></div>
        </div>

        <!-- Log Panel -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h2 style="margin: 0;">Detailed Logs</h2>
            <button id="toggle-logs" style="
              background: transparent;
              color: #2196f3;
              border: 1px solid #2196f3;
              padding: 5px 10px;
              border-radius: 4px;
              cursor: pointer;
            ">Show Logs</button>
          </div>
          <div id="log-panel" style="
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 15px;
            max-height: 0;
            overflow-y: hidden;
            transition: max-height 0.3s;
          "></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.uiContainer);

    // Add event listeners
    this.setupEventListeners();

    console.log('[StatusReporter] ✓ Status UI created');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const toggleBtn = document.getElementById('toggle-logs');
    const logPanel = document.getElementById('log-panel');

    if (toggleBtn && logPanel) {
      let logsVisible = false;
      
      toggleBtn.addEventListener('click', () => {
        logsVisible = !logsVisible;
        
        if (logsVisible) {
          logPanel.style.maxHeight = '300px';
          toggleBtn.textContent = 'Hide Logs';
        } else {
          logPanel.style.maxHeight = '0';
          toggleBtn.textContent = 'Show Logs';
        }
      });
    }
  }

  /**
   * Update status
   */
  update(update: StatusUpdate): void {
    // Add to history
    this.updates.push(update);

    // Log to console
    const statusEmoji = this.getStatusEmoji(update.status);
    console.log(`[StatusReporter] ${statusEmoji} ${update.stage}: ${update.message}`);

    // Update UI if enabled
    if (this.isUIEnabled && this.uiContainer) {
      this.updateUI(update);
    }
  }

  /**
   * Update UI elements
   */
  private updateUI(update: StatusUpdate): void {
    // Update progress bar
    this.updateProgressBar(update.progress);
    
    // Update stage list
    this.updateStageList(update);
    
    // Update performance metrics
    this.updatePerformanceMetrics(update);
    
    // Update log panel
    this.updateLogPanel(update);
  }

  /**
   * Update progress bar
   */
  private updateProgressBar(progress: number): void {
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    if (progressPercent) {
      progressPercent.textContent = `${Math.round(progress)}%`;
    }
  }

  /**
   * Update stage list
   */
  private updateStageList(currentUpdate: StatusUpdate): void {
    const stageList = document.getElementById('stage-list');
    if (!stageList) return;

    // Get unique stages from updates
    const stages = [...new Set(this.updates.map(u => u.stage))];
    
    stageList.innerHTML = stages.map(stage => {
      const stageUpdates = this.updates.filter(u => u.stage === stage);
      const latestUpdate = stageUpdates[stageUpdates.length - 1];
      
      const statusEmoji = this.getStatusEmoji(latestUpdate?.status || 'pending');
      const duration = latestUpdate?.duration ? `(${latestUpdate.duration.toFixed(0)}ms)` : '';
      
      return `
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #1a1a1a;
          border-radius: 4px;
          border-left: 4px solid ${this.getStatusColor(latestUpdate?.status || 'pending')};
        ">
          <div>
            <strong>${stage}</strong>
            <div style="font-size: 0.9em; opacity: 0.8; margin-top: 2px;">${latestUpdate?.message || 'Pending...'}</div>
          </div>
          <div style="text-align: right;">
            <div>${statusEmoji}</div>
            <div style="font-size: 0.9em; opacity: 0.8;">${duration}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(update: StatusUpdate): void {
    const metricsContainer = document.getElementById('metrics');
    if (!metricsContainer) return;

    const completedStages = this.updates.filter(u => u.status === 'success').length;
    const failedStages = this.updates.filter(u => u.status === 'error').length;
    const totalDuration = this.updates.reduce((sum, u) => sum + (u.duration || 0), 0);
    
    metricsContainer.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 1.5em; font-weight: bold;">${completedStages}</div>
        <div style="font-size: 0.9em; opacity: 0.8;">Stages Completed</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 1.5em; font-weight: bold;">${failedStages}</div>
        <div style="font-size: 0.9em; opacity: 0.8;">Stages Failed</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 1.5em; font-weight: bold;">${totalDuration.toFixed(0)}ms</div>
        <div style="font-size: 0.9em; opacity: 0.8;">Total Duration</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 1.5em; font-weight: bold;">${this.updates.length}</div>
        <div style="font-size: 0.9em; opacity: 0.8;">Total Updates</div>
      </div>
    `;
  }

  /**
   * Update log panel
   */
  private updateLogPanel(update: StatusUpdate): void {
    const logPanel = document.getElementById('log-panel');
    if (!logPanel) return;

    const timestamp = new Date().toLocaleTimeString();
    const statusEmoji = this.getStatusEmoji(update.status);
    
    const logEntry = document.createElement('div');
    logEntry.style.cssText = `
      margin-bottom: 5px;
      padding: 5px;
      border-left: 3px solid ${this.getStatusColor(update.status)};
      background: #1a1a1a;
    `;
    
    logEntry.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.9em; opacity: 0.8;">
        <span>${timestamp}</span>
        <span>${update.stage}</span>
      </div>
      <div style="margin-top: 2px;">${statusEmoji} ${update.message}</div>
      ${update.error ? `<div style="color: #f44336; font-size: 0.9em; margin-top: 2px;">${update.error.message}</div>` : ''}
    `;
    
    logPanel.appendChild(logEntry);
    
    // Auto-scroll to bottom
    logPanel.scrollTop = logPanel.scrollHeight;
  }

  /**
   * Finalize bootstrap process
   */
  finalize(result: BootstrapResult): void {
    console.log('[StatusReporter] Finalizing bootstrap process...');
    
    if (this.uiContainer) {
      // Update final status
      const successCount = result.results.filter(r => r.success).length;
      const totalStages = result.results.length;
      
      const statusText = result.success ? '✅ Bootstrap Completed Successfully' : '❌ Bootstrap Failed';
      const summaryText = `${successCount}/${totalStages} stages completed in ${result.totalDuration.toFixed(0)}ms`;
      
      // Add final summary
      const summaryDiv = document.createElement('div');
      summaryDiv.style.cssText = `
        text-align: center;
        margin-top: 30px;
        padding: 20px;
        background: ${result.success ? '#4caf50' : '#f44336'};
        border-radius: 8px;
      `;
      
      summaryDiv.innerHTML = `
        <h2 style="margin: 0 0 10px 0;">${statusText}</h2>
        <p style="margin: 0; opacity: 0.9;">${summaryText}</p>
      `;
      
      this.uiContainer.querySelector('#stage-list')?.parentNode?.appendChild(summaryDiv);
      
      // Auto-remove UI after 3 seconds if successful
      if (result.success) {
        setTimeout(() => {
          this.removeUI();
        }, 3000);
      }
    }
    
    console.log('[StatusReporter] ✓ Bootstrap finalized');
  }

  /**
   * Remove UI
   */
  removeUI(): void {
    if (this.uiContainer && this.uiContainer.parentNode) {
      this.uiContainer.parentNode.removeChild(this.uiContainer);
      this.uiContainer = null;
      console.log('[StatusReporter] ✓ Status UI removed');
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

  /**
   * Get status emoji
   */
  private getStatusEmoji(status: StatusUpdate['status']): string {
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
  private getStatusColor(status: StatusUpdate['status']): string {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'running': return '#2196f3';
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#9e9e9e';
    }
  }
}
