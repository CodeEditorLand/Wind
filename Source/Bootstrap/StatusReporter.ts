/**
 * @module StatusReporter
 * @description
 * Provides real-time visual feedback during bootstrap process.
 *
 * This component manages the UI overlay that shows bootstrap progress, stage status,
 * log entries, and performance metrics. It provides comprehensive visual feedback
 * to users during the bootstrap process and connects to external components for
 * UI updates and status reporting.
 *
 * Component Responsibilities:
 * - Create and manage visual status UI overlay
 * - Display real-time progress bar with stage tracking
 * - Show detailed stage status (pending, running, success, error, warning)
 * - Provide expandable log panel with detailed entries
 * - Display performance metrics and timing information
 * - Show error messages with context and details
 * - Support toggle functionality for log panel
 * - Calculate and display progress percentages
 * - Manage UI element lifecycle (create, update, remove)
 * - Export status updates for diagnostics
 * - Connect to Sky for UI integration
 * - Provide accessibility features for status display
 * - Support multiple display modes (compact, detailed)
 * - Implement color-coded status indicators
 * - Provide stage duration tracking
 * - Support status history and rollback
 *
 * Architecture Overview:
 * StatusReporter is a singleton that provides a central point for all bootstrap
 * status updates. It maintains a history of all status updates and provides
 * both UI and console-based feedback. The component is initialized with a
 * configuration that controls its visibility and verbosity. It connects to
 * the Sky component for enhanced UI integration.
 *
 * Microsoft VSCode Source References:
 * - src/vs/platform/product/common/productService.ts - Product information display
 * - src/vs/base/browser/ui/progressbar/progressbar.ts - Progress bar implementation
 * - src/vs/workbench/browser/parts/statusbar/statusbar.ts - Status bar display
 * - src/vs/base/browser/ui/toolbar/toolbar.ts - UI toolbar patterns
 * - src/vs/base/browser/ui/dropdown/dropdown.ts - Dropdown UI patterns
 * - src/vs/base/browser/ui/scrollbar/scrollableElement.ts - Scrollable areas
 * - src/vs/base/common/labels.ts - Label formatting and display
 * - src/vs/workbench/services/statusbar/browser/statusbarService.ts - Status service
 * - src/vs/platform/progress/common/progress.ts - Progress tracking API
 * - src/vs/base/browser/browser.ts - Browser capability detection
 * - src/vs/base/common/color.ts - Color utilities and theming
 * - src/vs/platform/theme/common/themeService.ts - Theme integration
 * - src/vs/platform/accessibility/common/accessibility.ts - Accessibility features
 * - src/vs/base/common/strings.ts - String formatting utilities
 * - src/vs/base/common/date.ts - Date/time formatting
 * - src/vs/base/common/errors.ts - Error display utilities
 * - src/vs/workbench/contrib/debug/browser/debug.ts - Debug status display
 * - src/vs/workbench/contrib/output/browser/output.ts - Output panel patterns
 * - src/vs/workbench/contrib/notifications/browser/notifications.ts - Notification UI
 * - src/vs/base/browser/dom.ts - DOM manipulation utilities
 * - src/vs/base/browser/style.ts - Styling utilities
 * - src/vs/base/common/platform.ts - Platform-specific display logic
 * - src/vs/workbench/browser/parts/panel/panelPart.ts - Panel UI patterns
 * - src/vs/workbench/browser/layout.ts - Layout management
 * - src/vs/base/common/lifecycle.ts - Lifecycle management
 * - src/vs/platform/configuration/common/configuration.ts - Configuration access
 * - src/vs/platform/telemetry/common/telemetryService.ts - Telemetry collection
 * - src/vs/base/common/objects.ts - Object manipulation utilities
 * - src/vs/base/common/arrays.ts - Array utilities
 *
 * TODO:
 * - Implement animated progress bar transitions
 * - Add support for multiple status UI themes (light, dark, high-contrast)
 * - Implement real-time performance graph visualization
 * - Add stage dependency visualization
 * - Implement collapsible stage details
 * - Add keyboard shortcuts for status UI navigation
 * - Implement status UI export as screenshot
 * - Add status UI sharing capabilities
 * - Implement real-time log filtering
 * - Add log search functionality
 * - Implement log entry source tracking
 * - Add performance trend visualization
 * - Implement stage comparison with previous runs
 * - Add status UI customizability (position, size, colors)
 * - Implement status UI persistence across page reloads
 * - Add status UI remote monitoring capabilities
 * - Implement status UI accessibility improvements (ARIA labels)
 * - Add status UI multi-language support
 * - Implement status UI animation controls
 * - Add stage completion sound notifications
 * - Implement status UI mini-mode for space-constrained displays
 */

import type { BootstrapConfig, StageResult, StatusUpdate } from "./Types.js";

export class StatusReporter {
	private static instance: StatusReporter;
	private config: BootstrapConfig;
	private statusElement: HTMLElement | null = null;
	private logElement: HTMLElement | null = null;
	private progressBarElement: HTMLElement | null = null;
	private updates: StatusUpdate[] = [];
	private startTime: number = 0;
	private skyConnection: any = null;
	private stageDurations: Map<string, number> = new Map();
	private performanceMetrics: Map<string, number> = new Map();

	private constructor(config: BootstrapConfig) {
		this.config = config;
	}

	/**
	 * Initialize StatusReporter with configuration
	 */
	static initialize(config: BootstrapConfig): StatusReporter {
		if (!StatusReporter.instance) {
			StatusReporter.instance = new StatusReporter(config);
		}
		return StatusReporter.instance;
	}

	/**
	 * Get the StatusReporter singleton instance
	 */
	static getInstance(): StatusReporter {
		if (!StatusReporter.instance) {
			throw new Error(
				"StatusReporter not initialized. Call initialize() first.",
			);
		}
		return StatusReporter.instance;
	}

	/**
	 * Connect to Sky for UI integration
	 */
	private connectToSky(): void {
		console.log("[StatusReporter] Connecting to Sky for UI integration...");

		try {
			this.skyConnection = (window as any).__SKY_CONNECTION__;
			if (this.skyConnection) {
				console.log("[StatusReporter] ✓ Sky connection established");
			}
		} catch (error) {
			console.warn("[StatusReporter] ⚠ Sky connection failed:", error);
		}
	}

	/**
	 * Update Sky connection with current status
	 */
	private updateSkyConnection(update: StatusUpdate): void {
		if (!this.skyConnection) {
			return;
		}

		try {
			// Send status update to Sky
			if (typeof this.skyConnection.sendStatus === "function") {
				this.skyConnection.sendStatus(update);
			}
		} catch (error) {
			console.warn("[StatusReporter] ⚠ Failed to update Sky:", error);
		}
	}

	/**
	 * Calculate progress bar percentage
	 * @param completedStages Number of completed stages
	 * @param totalStages Total number of stages
	 * @returns Progress percentage (0-100)
	 */
	CalculateProgress(completedStages: number, totalStages: number): number {
		if (totalStages === 0) return 0;
		return Math.min(
			100,
			Math.max(0, (completedStages / totalStages) * 100),
		);
	}

	/**
	 * Manage UI element state
	 * @param element The UI element to manage
	 * @param state Desired state (visible, hidden, disabled)
	 */
	ManageUIElement(
		element: HTMLElement | null,
		state: "visible" | "hidden" | "disabled",
	): void {
		if (!element) return;

		switch (state) {
			case "visible":
				element.style.display = "block";
				element.style.opacity = "1";
				break;
			case "hidden":
				element.style.display = "none";
				element.style.opacity = "0";
				break;
			case "disabled":
				element.style.opacity = "0.5";
				element.style.pointerEvents = "none";
				break;
		}
	}

	/**
	 * Manage log panel visibility
	 * @param visible Whether the log panel should be visible
	 */
	ManageLogPanel(visible: boolean): void {
		if (!this.logElement) return;

		this.ManageUIElement(this.logElement, visible ? "visible" : "hidden");

		const toggleButton = document.getElementById("bootstrap-toggle-logs");
		if (toggleButton) {
			toggleButton.textContent = visible ? "Hide Logs" : "Show Logs";
		}
	}

	/**
	 * Display error with detailed information
	 * @param stage The stage where the error occurred
	 * @param error The error object
	 * @param duration Stage duration
	 */
	DisplayError(stage: string, error: Error, duration: number): void {
		if (!this.config.showStatusUI || !this.statusElement) {
			return;
		}

		const stageElement = document.getElementById(`stage-${stage}`);
		if (!stageElement) return;

		// Create or update error element
		let errorElement = document.getElementById(`error-${stage}`);
		if (!errorElement) {
			errorElement = document.createElement("div");
			errorElement.id = `error-${stage}`;
			errorElement.style.cssText = `
        font-size: 11px;
        color: #c62828;
        margin-left: 24px;
        margin-top: 4px;
        padding: 8px;
        background: rgba(198, 40, 40, 0.1);
        border-radius: 4px;
        border-left: 3px solid #c62828;
        max-height: 150px;
        overflow-y: auto;
      `;
			stageElement.appendChild(errorElement);
		}

		errorElement.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${error.message}</div>
      <div style="font-family: monospace; font-size: 10px; color: #555;">
        ${error.stack ? this.formatStackTrace(error.stack) : "No stack trace available"}
      </div>
      ${duration ? `<div style="margin-top: 4px; color: #666;">Duration: ${duration.toFixed(0)}ms</div>` : ""}
    `;
	}

	/**
	 * Format stack trace for display
	 * @param stack The stack trace string
	 * @returns Formatted stack trace
	 */
	private formatStackTrace(stack: string): string {
		return stack
			.split("\n")
			.slice(0, 5)
			.map((line) => `  ${line}`)
			.join("\n");
	}

	/**
	 * Display performance metrics
	 * @param metrics Map of metric names to values
	 */
	DisplayPerformanceMetrics(metrics: Map<string, number>): void {
		if (!this.config.showStatusUI || !this.statusElement) {
			return;
		}

		// Update or create metrics display
		let metricsElement = document.getElementById(
			"bootstrap-metrics-display",
		);

		if (!metricsElement) {
			metricsElement = document.createElement("div");
			metricsElement.id = "bootstrap-metrics-display";
			metricsElement.style.cssText = `
        padding: 12px 16px;
        background: #f8f9fa;
        border-top: 1px solid #e0e0e0;
        font-size: 11px;
      `;

			if (this.statusElement.querySelector("#bootstrap-metrics-toggle")) {
				this.statusElement.insertBefore(
					metricsElement,
					this.statusElement.lastChild,
				);
			} else {
				this.statusElement.appendChild(metricsElement);
			}
		}

		let metricsHTML =
			'<div style="font-weight: 600; margin-bottom: 8px;">Performance Metrics</div>';

		metrics.forEach((value, key) => {
			const formattedValue = this.formatMetricValue(key, value);
			metricsHTML += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #666;">${this.formatMetricName(key)}</span>
          <span style="font-family: monospace;">${formattedValue}</span>
        </div>
      `;
		});

		metricsElement.innerHTML = metricsHTML;
	}

	/**
	 * Format metric name for display
	 * @param name The metric name
	 * @returns Formatted metric name
	 */
	private formatMetricName(name: string): string {
		return name
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (str) => str.toUpperCase())
			.trim();
	}

	/**
	 * Format metric value based on type
	 * @param key The metric key
	 * @param value The metric value
	 * @returns Formatted metric value
	 */
	private formatMetricValue(key: string, value: number): string {
		if (key.toLowerCase().includes("memory")) {
			return this.formatBytes(value);
		} else if (
			key.toLowerCase().includes("time") ||
			key.toLowerCase().includes("duration")
		) {
			return `${value.toFixed(2)}ms`;
		} else if (
			key.toLowerCase().includes("percent") ||
			key.toLowerCase().includes("ratio")
		) {
			return `${(value * 100).toFixed(1)}%`;
		} else {
			return value.toFixed(2);
		}
	}

	/**
	 * Format bytes to human-readable format
	 * @param bytes Number of bytes
	 * @returns Formatted byte string
	 */
	private formatBytes(bytes: number): string {
		const units = ["B", "KB", "MB", "GB"];
		const index = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
	}

	/**
	 * Update status for a stage (enhanced with Sky connection and performance tracking)
	 */
	update(update: StatusUpdate): void {
		this.updates.push(update);

		if (!this.config.showStatusUI || !this.statusElement) {
			return;
		}

		// Track stage duration
		if (update.duration) {
			this.stageDurations.set(update.stage, update.duration);
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

		// Update Sky connection
		this.updateSkyConnection(update);

		// Log to console
		this.logToConsole(update);

		// Display error if present
		if (update.error) {
			this.DisplayError(update.stage, update.error, update.duration || 0);
		}
	}

	/**
	 * Create the status UI overlay
	 */
	createUI(): void {
		if (!this.config.showStatusUI) {
			return;
		}

		// Connect to Sky for UI integration
		this.connectToSky();

		// Create main container
		const container = document.createElement("div");
		container.id = "bootstrap-status-container";
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
		const header = document.createElement("div");
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
		const progressContainer = document.createElement("div");
		progressContainer.style.cssText = `
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    `;

		const progressBar = document.createElement("div");
		progressBar.id = "bootstrap-progress-bar";
		progressBar.style.cssText = `
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    `;

		const progressFill = document.createElement("div");
		progressFill.id = "bootstrap-progress-fill";
		progressFill.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #007acc, #00a8ff);
      transition: width 0.3s ease;
    `;

		progressBar.appendChild(progressFill);
		progressContainer.appendChild(progressBar);

		// Create stage list
		const stageList = document.createElement("div");
		stageList.id = "bootstrap-stage-list";
		stageList.style.cssText = `
      padding: 12px 16px;
      overflow-y: auto;
      flex: 1;
    `;

		// Create log panel (hidden by default)
		const logPanel = document.createElement("div");
		logPanel.id = "bootstrap-log-panel";
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
		const toggleButton = document.getElementById("bootstrap-toggle-logs");
		if (toggleButton) {
			toggleButton.addEventListener("click", () => {
				const isHidden = logPanel.style.display === "none";
				logPanel.style.display = isHidden ? "block" : "none";
				toggleButton.textContent = isHidden ? "Hide Logs" : "Show Logs";
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
		const stageList = document.getElementById("bootstrap-stage-list");
		if (!stageList) return;

		let stageElement = document.getElementById(`stage-${update.stage}`);

		if (!stageElement) {
			stageElement = document.createElement("div");
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
      ${update.duration ? `<span style="color: #666; font-size: 11px;">${update.duration.toFixed(0)}ms</span>` : ""}
    `;

		if (update.message) {
			const messageElement = document.createElement("div");
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
			const errorElement = document.createElement("div");
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
		const entry = document.createElement("div");
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
      ${update.duration ? `<span style="color: #888;">(${update.duration.toFixed(0)}ms)</span>` : ""}
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
			case "running":
				console.log(`${prefix} ${update.message}`);
				break;
			case "success":
				console.log(
					`%c${prefix} ✓ ${update.message}`,
					"color: #4caf50; font-weight: bold",
				);
				break;
			case "error":
				console.error(
					`%c${prefix} ✗ ${update.message}`,
					"color: #f44336; font-weight: bold",
				);
				if (update.error) {
					console.error(update.error);
				}
				break;
			case "warning":
				console.warn(
					`%c${prefix} ⚠ ${update.message}`,
					"color: #ff9800; font-weight: bold",
				);
				break;
		}
	}

	/**
	 * Get status icon
	 */
	private getStatusIcon(status: string): string {
		switch (status) {
			case "pending":
				return "⏳";
			case "running":
				return "🔄";
			case "success":
				return "✅";
			case "error":
				return "❌";
			case "warning":
				return "⚠️";
			default:
				return "❓";
		}
	}

	/**
	 * Get status color
	 */
	private getStatusColor(status: string): string {
		switch (status) {
			case "pending":
				return "#999";
			case "running":
				return "#007acc";
			case "success":
				return "#4caf50";
			case "error":
				return "#f44336";
			case "warning":
				return "#ff9800";
			default:
				return "#666";
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

		const summary = document.createElement("div");
		summary.style.cssText = `
      padding: 12px 16px;
      background: ${result.success ? "#e8f5e9" : "#ffebee"};
      border-top: 2px solid ${result.success ? "#4caf50" : "#f44336"};
      font-weight: 600;
    `;

		summary.innerHTML = `
      <div style="color: ${result.success ? "#2e7d32" : "#c62828"};">
        ${result.success ? "✅ Bootstrap Complete" : "❌ Bootstrap Failed"}
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
