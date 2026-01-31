/**
 * @module Stage5-Initialization
 * @description
 * Stage 5: Workbench Initialization
 *
 * This stage creates and starts the VSCode workbench instance, ensuring all services
 * are properly registered and the workbench lifecycle is managed correctly. It handles
 * service registration, workbench creation, startup, and state validation.
 *
 * Component Responsibilities:
 * - Retrieve and validate workbench configuration
 * - Get or create service collection from previous stages
 * - Create Workbench instance with proper dependencies
 * - Register core services before workbench startup
 * - Start workbench and verify it's running
 * - Validate workbench state and functionality
 * - Implement service lifecycle management
 * - Handle workbench startup errors with recovery
 * - Circuit breaker pattern for critical initialization failures
 * - Connect to Mountain for backend integration
 * - Performance metrics collection during initialization
 *
 * Architecture Overview:
 * This stage is the core of the bootstrap process where the actual VSCode workbench
 * is instantiated. It bridges the preparation phase (Stage 4) with the validation phase
 * (Stage 6). The workbench is created using VSCode's dependency injection system
 * and service collection framework. The stage implements recovery strategies for common
 * startup failures and validates that all critical workbench methods are available.
 *
 * Microsoft VSCode Source References:
 * - src/vs/workbench/browser/workbench.ts - Main Workbench class and initialization
 * - src/vs/platform/instantiation/common/serviceCollection.ts - Service collection management
 * - src/vs/workbench/services/extensions/common/extensions.ts - Extension service setup
 * - src/vs/workbench/browser/shell.ts - Shell integration and layout
 * - src/vs/workbench/browser/actions.ts - Workbench action registration
 * - src/vs/workbench/browser/layout.ts - Layout service initialization
 * - src/vs/workbench/services/editor/browser/editorService.ts - Editor service setup
 * - src/vs/workbench/services/lifecycle/common/lifecycle.ts - Lifecycle service
 * - src/vs/platform/lifecycle/common/lifecycle.ts - Lifecycle event handling
 * - src/vs/workbench/services/telemetry/common/telemetryService.ts - Telemetry setup
 * - src/vs/workbench/services/history/browser/historyService.ts - History service
 * - src/vs/workbench/services/keybinding/common/keybindingService.ts - Keybinding service
 * - src/vs/workbench/services/contextkey/browser/contextKeyService.ts - Context key service
 * - src/vs/workbench/services/backup/common/backup.ts - Backup service
 * - src/vs/workbench/services/host/browser/hostService.ts - Host service
 * - src/vs/platform/storage/common/storage.ts - Storage service
 * - src/vs/workbench/services/configuration/common/configuration.ts - Configuration service
 * - src/vs/workbench/services/textfile/common/textfiles.ts - Text file service
 * - src/vs/workbench/services/files/common/files.ts - File service
 * - src/vs/workbench/services/output/common/outputService.ts - Output service
 * - src/vs/workbench/services/panel/common/panelService.ts - Panel service
 * - src/vs/workbench/services/view/common/viewDescriptorService.ts - View descriptor service
 * - src/vs/platform/theme/common/themeService.ts - Theme service
 * - src/vs/workbench/services/theme/browser/themeService.ts - Browser theme service
 * - src/vs/platform/opener/common/opener.ts - Opener service
 * - src/vs/workbench/browser/parts/activitybar/activitybarPart.ts - Activity bar
 * - src/vs/workbench/browser/parts/sidebar/sidebarPart.ts - Sidebar
 * - src/vs/workbench/browser/parts/editor/editorPart.ts - Editor
 * - src/vs/workbench/browser/parts/statusbar/statusbarPart.ts - Status bar
 * - src/vs/workbench/browser/parts/titlebar/titlebarPart.ts - Title bar
 * - src/vs/workbench/browser/parts/panel/panelPart.ts - Panel
 *
 * TODO:
 * - Implement incremental workbench initialization for faster startup
 * - Add service health checks before workbench startup
 * - Implement workbench warmup strategy for subsequent launches
 * - Add workbench state persistence and restoration
 * - Implement graceful workbench restart on failures
 * - Add workbench metrics collection and reporting
 * - Implement service lazy loading for non-critical services
 * - Add workbench lifecycle hooks for custom extensions
 * - Implement workbench performance profiling
 * - Add workbench state validation with diagnostic logging
 * - Implement service dependency graph validation
 * - Add workbench startup telemetry
 * - Implement recovery for specific workbench startup failures
 * - Add workbench memory usage monitoring
 * - Implement workbench garbage collection hints
 * - Add workbench DOM event delegation optimization
 * - Implement workbench accessibility initialization
 * - Add workbench keyboard navigation setup
 * - Implement workbench drag and drop initialization
 * - Add workbench context menu setup
 * - Implement workbench notification system initialization
 * - Add workbench command palette setup
 * - Implement workbench search service initialization
 * - Add workbench language service initialization
 */
import type { StageResult } from './Types.js';
export declare class InitializationStage {
    static readonly STAGE_NAME: "Initialization";
    private static readonly CIRCUIT_BREAKER_TIMEOUT;
    private static readonly CIRCUIT_BREAKER_THRESHOLD;
    private static readonly circuitBreakerState;
    /**
     * Execute the workbench initialization stage
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
     * Connect to Mountain for backend integration
     */
    private static ConnectToMountain;
    /**
     * Register core services
     */
    private static registerCoreServices;
    /**
     * Initialize service lifecycle
     */
    private static InitializeServiceLifecycle;
    /**
     * Get configuration from window.vscode.context
     */
    private static getConfiguration;
    /**
     * Get service collection
     */
    private static getServiceCollection;
    /**
     * Create minimal service collection
     */
    private static createMinimalServiceCollection;
    /**
     * Create workbench instance with timeout
     */
    private static createWorkbenchWithTimeout;
    /**
     * Create workbench instance
     */
    private static createWorkbench;
    /**
     * Start workbench with timeout
     */
    private static startWorkbenchWithTimeout;
    /**
     * Start workbench
     */
    private static startWorkbench;
    /**
     * Validate workbench state
     */
    private static validateWorkbenchState;
}
//# sourceMappingURL=Stage5-Initialization.d.ts.map