/**
 * @module TauriWorkbench
 * @description
 * Tauri Workbench implementation for VSCode desktop integration.
 * Replaces Electron's workbench with Tauri-compatible workbench implementation.
 *
 * Architecture:
 * - Extends Layout class for workbench layout
 * - Manages workbench parts (titlebar, sidebar, editor, etc.)
 * - Handles service initialization and lifecycle
 * - Provides seamless VSCode workbench experience
 *
 * VSCode Source Reference: `vs/workbench/browser/workbench.ts`
 * TODO: Complete workbench parts implementation
 * TODO: Implement service initialization sequence
 * TODO: Add comprehensive error handling
 */
/**
 * Workbench options
 */
export interface ITauriWorkbenchOptions {
    extraClasses?: string[];
    resetLayout?: boolean;
    enableDebugMode?: boolean;
    enablePerformanceTracking?: boolean;
}
/**
 * Workbench parts enumeration
 */
export declare enum WorkbenchParts {
    TITLEBAR_PART = "titlebar",
    BANNER_PART = "banner",
    ACTIVITYBAR_PART = "activitybar",
    SIDEBAR_PART = "sidebar",
    EDITOR_PART = "editor",
    PANEL_PART = "panel",
    AUXILIARYBAR_PART = "auxiliarybar",
    STATUSBAR_PART = "statusbar"
}
/**
 * Workbench layout interface
 */
export interface IWorkbenchLayoutService {
}
/**
 * Layout base class (placeholder)
 */
export declare class Layout {
    constructor(parent: HTMLElement, options: any);
    layout(): void;
    dispose(): void;
}
/**
 * Tauri Workbench implementation
 */
export declare class TauriWorkbench extends Layout implements IWorkbenchLayoutService {
    private options;
    private serviceCollection;
    private parts;
    private mainContainer;
    private isInitialized;
    private previousUnexpectedError;
    constructor(parent: HTMLElement, options: ITauriWorkbenchOptions | undefined, serviceCollection: any);
    /**
     * Register error handlers
     */
    private registerErrorHandler;
    /**
     * Handle unexpected errors
     */
    private handleUnexpectedError;
    /**
     * Convert error to message
     */
    private toErrorMessage;
    /**
     * Set unexpected error handler
     */
    private setUnexpectedErrorHandler;
    /**
     * Start workbench
     */
    startup(): any;
    /**
     * Initialize services
     */
    private initServices;
    /**
     * Create instantiation service
     */
    private createInstantiationService;
    /**
     * Initialize layout
     */
    private initLayout;
    /**
     * Render workbench
     */
    private renderWorkbench;
    /**
     * Apply workbench classes
     */
    private applyWorkbenchClasses;
    /**
     * Get layout classes
     */
    private getLayoutClasses;
    /**
     * Create workbench parts
     */
    private createParts;
    /**
     * Create individual part
     */
    private createPart;
    /**
     * Create notification handlers
     */
    private createNotificationHandlers;
    /**
     * Create workbench layout
     */
    private createWorkbenchLayout;
    /**
     * Restore workbench state
     */
    private restore;
    /**
     * Restore parts
     */
    private restoreParts;
    /**
     * Set global leak warning threshold
     */
    private setGlobalLeakWarningThreshold;
    /**
     * Set ARIA container
     */
    private setARIAContainer;
    /**
     * Get parent element
     */
    private getParentElement;
    /**
     * Dispose workbench
     */
    dispose(): void;
    /**
     * Check if workbench is initialized
     */
    isInitialized(): boolean;
    /**
     * Get main container
     */
    getMainContainer(): HTMLElement;
}
export declare function createTauriWorkbench(parent: HTMLElement, options?: ITauriWorkbenchOptions, serviceCollection?: any): TauriWorkbench;
//# sourceMappingURL=TauriWorkbench.d.ts.map