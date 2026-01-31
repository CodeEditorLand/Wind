/**
 * @module Stage6-HealthCheck
 * @description
 * Stage 6: Health Check
 *
 * This stage performs comprehensive health checks on the initialized workbench to ensure
 * all core functionality is working correctly. It verifies workbench status, tests core
 * APIs, checks for errors, collects health metrics, and provides recovery actions for
 * detected issues.
 *
 * Component Responsibilities:
 * - Verify workbench instance is running and responsive
 * - Test core VSCode APIs (IPC, configuration, services)
 * - Validate DOM structure and workbench UI elements
 * - Check for accumulated errors and warnings
 * - Collect health metrics (memory, performance, timing)
 * - Test inter-process communication (IPC)
 * - Validate service availability and functionality
 * - Check network connectivity and backend health
 * - Implement recovery actions for common issues
 * - Circuit breaker pattern to prevent cascading failures
 * - Performance metrics collection and reporting
 * - Diagnostic logging for troubleshooting
 * - Connect to Air for build status monitoring
 * - Health status aggregation and reporting
 *
 * Architecture Overview:
 * This is the final validation stage before the bootstrap process completes. It ensures
 * that the workbench is fully functional and ready for user interaction. The stage runs
 * a series of health checks and aggregates results. If critical issues are found, it can
 * trigger recovery actions or report problems. Non-critical issues are logged as warnings.
 * The stage collects comprehensive metrics for diagnostic purposes.
 *
 * Microsoft VSCode Source References:
 * - src/vs/base/common/lifecycle.ts - Lifecycle and readiness checks
 * - src/vs/workbench/browser/workbench.ts - Workbench status and state
 * - src/vs/platform/ipc/common/ipc.ts - IPC health checks
 * - src/vs/platform/configuration/common/configurationService.ts - Configuration validation
 * - src/vs/workbench/services/health/common/healthService.ts - Health check service
 * - src/vs/workbench/services/diagnostics/common/diagnostics.ts - Diagnostic collection
 * - src/vs/platform/telemetry/common/telemetryService.ts - Telemetry for health metrics
 * - src/vs/base/browser/performance.ts - Performance measurement
 * - src/vs/base/common/errorMessage.ts - Error analysis and categorization
 * - src/vs/workbench/browser/parts/editor/editor.ts - Editor health checks
 * - src/vs/workbench/browser/parts/statusbar/statusbar.ts - Status bar validation
 * - src/vs/workbench/browser/parts/activitybar/activitybar.ts - Activity bar validation
 * - src/vs/workbench/browser/parts/sidebar/sidebar.ts - Sidebar validation
 * - src/vs/workbench/browser/parts/panel/panel.ts - Panel validation
 * - src/vs/workbench/services/output/common/outputService.ts - Output service checks
 * - src/vs/workbench/services/terminal/common/terminalService.ts - Terminal service checks
 * - src/vs/workbench/services/search/common/searchService.ts - Search service checks
 * - src/vs/workbench/services/keybinding/common/keybindingService.ts - Keybinding checks
 * - src/vs/workbench/services/theme/browser/themeService.ts - Theme validation
 * - src/vs/platform/storage/common/storage.ts - Storage service checks
 * - src/vs/workbench/services/backup/common/backup.ts - Backup health checks
 * - src/vs/workbench/services/history/browser/historyService.ts - History service checks
 * - src/vs/workbench/services/dialogs/common/dialogService.ts - Dialog service checks
 * - src/vs/workbench/services/notification/common/notificationService.ts - Notification checks
 * - src/vs/workbench/services/editor/common/editorService.ts - Editor service checks
 * - src/vs/base/common/platform.ts - Platform health checks
 * - src/vs/base/browser/browser.ts - Browser capability checks
 * - src/vs/base/common/network.ts - Network connectivity checks
 * - src/vs/workbench/services/extensions/common/extensions.ts - Extension health checks
 *
 * TODO:
 * - Implement periodic health rechecks after initial validation
 * - Add health score calculation and threshold alerting
 * - Implement health trend analysis and predictions
 * - Add automatic recovery for specific health issues
 * - Implement health check result caching
 * - Add health check scheduling and interval management
 * - Implement custom health check registration API
 * - Add health check result export and reporting
 * - Implement health check visualization dashboard
 * - Add health check alerts and notifications
 * - Implement health check result history
 * - Add health check performance optimization
 * - Implement health check dependency management
 * - Add health check result aggregation across multiple instances
 * - Implement health check remote monitoring
 * - Add health check result persistence
 * - Implement health check result analysis and insights
 * - Add health check result comparison with baselines
 * - Implement health check result anomaly detection
 * - Add health check result impact assessment
 * - Implement health check result recommendation engine
 */
import type { StageResult } from './Types.js';
export declare class HealthCheckStage {
    static readonly STAGE_NAME: "HealthCheck";
    private static readonly CIRCUIT_BREAKER_TIMEOUT;
    private static readonly CIRCUIT_BREAKER_THRESHOLD;
    private static readonly circuitBreakerState;
    /**
     * Execute the health check stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Check if circuit breaker is open
     */
    private static isCircuitBreakerOpen;
    /**
     * Record circuit breaker failure
     */
    private static recordCircuitBreakerFailure;
    /**
     * Reset circuit breaker state
     */
    private static resetCircuitBreaker;
    /**
     * Connect to Air for build status
     */
    private static ConnectToAir;
    /**
     * Verify workbench is running with timeout
     */
    private static verifyWorkbenchRunningWithTimeout;
    /**
     * Verify workbench is running
     */
    private static verifyWorkbenchRunning;
    /**
     * Test DOM elements
     */
    private static testDOMElements;
    /**
     * Test workbench container
     */
    private static testWorkbenchContainer;
    /**
     * Test body element
     */
    private static testBodyElement;
    /**
     * Test required classes
     */
    private static testRequiredClasses;
    /**
     * Test core functionality
     */
    private static testCoreFunctionality;
    /**
     * Test window.vscode
     */
    private static testWindowVscode;
    /**
     * Test configuration
     */
    private static testConfiguration;
    /**
     * Test IPC
     */
    private static testIPC;
    /**
     * Test services
     */
    private static testServices;
    /**
     * Check for errors
     */
    private static checkForErrors;
    /**
     * Check network connectivity
     */
    private static checkConnectivity;
    /**
     * Execute recovery actions based on health check results
     */
    private static executeRecoveryActions;
    /**
     * Collect health metrics
     */
    private static collectHealthMetrics;
    /**
     * Get memory usage
     */
    private static getMemoryUsage;
}
//# sourceMappingURL=Stage6-HealthCheck.d.ts.map