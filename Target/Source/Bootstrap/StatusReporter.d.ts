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
import type { BootstrapConfig, StatusUpdate } from "./Types.js";
export declare class StatusReporter {
    private static instance;
    private config;
    private statusElement;
    private logElement;
    private progressBarElement;
    private updates;
    private startTime;
    private skyConnection;
    private stageDurations;
    private performanceMetrics;
    private constructor();
    /**
     * Initialize StatusReporter with configuration
     */
    static initialize(config: BootstrapConfig): StatusReporter;
    /**
     * Get the StatusReporter singleton instance
     */
    static getInstance(): StatusReporter;
    /**
     * Connect to Sky for UI integration
     */
    private connectToSky;
    /**
     * Update Sky connection with current status
     */
    private updateSkyConnection;
    /**
     * Calculate progress bar percentage
     * @param completedStages Number of completed stages
     * @param totalStages Total number of stages
     * @returns Progress percentage (0-100)
     */
    CalculateProgress(completedStages: number, totalStages: number): number;
    /**
     * Manage UI element state
     * @param element The UI element to manage
     * @param state Desired state (visible, hidden, disabled)
     */
    ManageUIElement(element: HTMLElement | null, state: "visible" | "hidden" | "disabled"): void;
    /**
     * Manage log panel visibility
     * @param visible Whether the log panel should be visible
     */
    ManageLogPanel(visible: boolean): void;
    /**
     * Display error with detailed information
     * @param stage The stage where the error occurred
     * @param error The error object
     * @param duration Stage duration
     */
    DisplayError(stage: string, error: Error, duration: number): void;
    /**
     * Format stack trace for display
     * @param stack The stack trace string
     * @returns Formatted stack trace
     */
    private formatStackTrace;
    /**
     * Display performance metrics
     * @param metrics Map of metric names to values
     */
    DisplayPerformanceMetrics(metrics: Map<string, number>): void;
    /**
     * Format metric name for display
     * @param name The metric name
     * @returns Formatted metric name
     */
    private formatMetricName;
    /**
     * Format metric value based on type
     * @param key The metric key
     * @param value The metric value
     * @returns Formatted metric value
     */
    private formatMetricValue;
    /**
     * Format bytes to human-readable format
     * @param bytes Number of bytes
     * @returns Formatted byte string
     */
    private formatBytes;
    /**
     * Create the status UI overlay
     */
    createUI(): void;
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