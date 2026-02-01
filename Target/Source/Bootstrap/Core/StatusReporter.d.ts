/**
 * @module Bootstrap/Core/StatusReporter
 * @description
 * Real-time visual feedback system for bootstrap process.
 */
import type { BootstrapResult, StatusUpdate } from "../Types/Types.js";
export declare class StatusReporter {
    private static instance;
    private updates;
    private uiContainer;
    private isUIEnabled;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): StatusReporter;
    /**
     * Initialize with configuration
     */
    static initialize(config: {
        showStatusUI: boolean;
    }): StatusReporter;
    /**
     * Create status UI
     */
    createUI(): void;
    /**
     * Setup event listeners
     */
    private setupEventListeners;
    /**
     * Update status
     */
    update(update: StatusUpdate): void;
    /**
     * Update UI elements
     */
    private updateUI;
    /**
     * Update progress bar
     */
    private updateProgressBar;
    /**
     * Update stage list
     */
    private updateStageList;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Update log panel
     */
    private updateLogPanel;
    /**
     * Finalize bootstrap process
     */
    finalize(result: BootstrapResult): void;
    /**
     * Remove UI
     */
    removeUI(): void;
    /**
     * Get all updates
     */
    getUpdates(): StatusUpdate[];
    /**
     * Export updates as JSON
     */
    exportUpdates(): string;
    /**
     * Get status emoji
     */
    private getStatusEmoji;
    /**
     * Get status color
     */
    private getStatusColor;
}
//# sourceMappingURL=StatusReporter.d.ts.map