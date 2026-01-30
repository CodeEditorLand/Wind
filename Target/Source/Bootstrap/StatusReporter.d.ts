/**
 * @module StatusReporter
 * @description
 * Provides real-time visual feedback during bootstrap process.
 */
import type { StatusUpdate, BootstrapConfig } from './Types.js';
export declare class StatusReporter {
    private static instance;
    private config;
    private statusElement;
    private logElement;
    private progressBarElement;
    private updates;
    private startTime;
    private constructor();
    static initialize(config: BootstrapConfig): StatusReporter;
    static getInstance(): StatusReporter;
    /**
     * Create the status UI overlay
     */
    createUI(): void;
    /**
     * Update status for a stage
     */
    update(update: StatusUpdate): void;
    /**
     * Update the stage list in the UI
     */
    private updateStageList;
    /**
     * Add entry to log panel
     */
    private addLogEntry;
    /**
     * Log to console
     */
    private logToConsole;
    /**
     * Get status icon
     */
    private getStatusIcon;
    /**
     * Get status color
     */
    private getStatusColor;
    /**
     * Update final result
     */
    finalize(result: any): void;
    /**
     * Remove the status UI
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
}
//# sourceMappingURL=StatusReporter.d.ts.map