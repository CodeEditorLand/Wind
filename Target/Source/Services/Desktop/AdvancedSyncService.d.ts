/**
 * @module AdvancedSyncService
 * @description
 * Advanced synchronization service that integrates with Mountain's WindAdvancedSync capabilities.
 * Provides real-time document synchronization, UI state management, and conflict resolution.
 *
 * Architecture:
 * - Real-time document synchronization with Mountain
 * - UI state management across multiple windows
 * - Advanced conflict resolution algorithms
 * - Performance monitoring and optimization
 *
 * Integration with Mountain's WindAdvancedSync.rs for seamless backend coordination.
 * Integrated with ConflictResolutionService and PerformanceDashboardService for advanced features.
 */
/**
 * Document synchronization state
 */
export interface IDocumentSyncState {
    documentId: string;
    filePath: string;
    lastModified: number;
    contentHash: string;
    syncState: SyncState;
    version: number;
    pendingChanges: IDocumentChange[];
}
/**
 * Document change
 */
export interface IDocumentChange {
    changeId: string;
    documentId: string;
    changeType: ChangeType;
    content: any;
    timestamp: number;
    applied: boolean;
}
/**
 * Change type
 */
export declare enum ChangeType {
    INSERT = "insert",
    DELETE = "delete",
    UPDATE = "update",
    FORMAT = "format",
    RENAME = "rename"
}
/**
 * Sync state
 */
export declare enum SyncState {
    SYNCED = "synced",
    MODIFIED = "modified",
    CONFLICTED = "conflicted",
    OFFLINE = "offline",
    SYNCING = "syncing"
}
/**
 * UI state synchronization
 */
export interface IUIStateSync {
    activeEditor?: string;
    cursorPositions: Map<string, ICursorPosition>;
    selectionRanges: Map<string, ISelectionRange>;
    viewState: IViewState;
    theme: string;
    layout: ILayoutState;
}
/**
 * Cursor position
 */
export interface ICursorPosition {
    line: number;
    column: number;
    documentId: string;
}
/**
 * Selection range
 */
export interface ISelectionRange {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    documentId: string;
}
/**
 * View state
 */
export interface IViewState {
    zoomLevel: number;
    sidebarVisible: boolean;
    panelVisible: boolean;
    statusBarVisible: boolean;
}
/**
 * Layout state
 */
export interface ILayoutState {
    editorGroups: IEditorGroup[];
    activeGroup: number;
    gridLayout: IGridLayout;
}
/**
 * Editor group
 */
export interface IEditorGroup {
    groupId: number;
    activeEditor?: string;
    editors: string[];
    dimensions: IDimensions;
}
/**
 * Dimensions
 */
export interface IDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * Grid layout
 */
export interface IGridLayout {
    rows: number;
    columns: number;
    cellWidth: number;
    cellHeight: number;
}
/**
 * Synchronization status
 */
export interface ISyncStatus {
    totalDocuments: number;
    syncedDocuments: number;
    conflictedDocuments: number;
    offlineDocuments: number;
    lastSyncDuration: number;
}
/**
 * Advanced sync service configuration
 */
export interface IAdvancedSyncConfig {
    enableRealTimeSync: boolean;
    syncInterval: number;
    enableConflictResolution: boolean;
    maxRetryAttempts: number;
    enablePerformanceMonitoring: boolean;
    enableOfflineSync: boolean;
}
/**
 * Advanced synchronization service
 */
export declare class AdvancedSyncService {
    private documentSync;
    private uiState;
    private config;
    private eventListeners;
    private syncIntervalId;
    private isConnected;
    private conflictResolutionService;
    private performanceDashboardService;
    private errorHandler;
    private performanceMonitor;
    constructor(config?: Partial<IAdvancedSyncConfig>);
    /**
     * Initialize synchronization service with production standards
     */
    initialize(): Promise<void>;
    /**
     * Set up event listeners for Mountain communication with production standards
     */
    private setupEventListeners;
    /**
     * Connect to Mountain backend
     */
    private connectToMountain;
    /**
     * Load initial state from Mountain
     */
    private loadInitialState;
    /**
     * Start synchronization
     */
    private startSynchronization;
    /**
     * Perform synchronization
     */
    private synchronize;
    /**
     * Synchronize documents
     */
    private synchronizeDocuments;
    /**
     * Synchronize individual document
     */
    private synchronizeDocument;
    /**
     * Handle document conflicts with production standards
     */
    private handleConflicts;
    /**
     * Assess conflict severity
     */
    private assessConflictSeverity;
    /**
     * Synchronize UI state
     */
    private synchronizeUIState;
    /**
     * Handle document update from Mountain
     */
    private handleDocumentUpdate;
    /**
     * Apply change to document
     */
    private applyChange;
    /**
     * Handle UI state update from Mountain
     */
    private handleUIStateUpdate;
    /**
     * Handle sync status update
     */
    private handleSyncStatusUpdate;
    /**
     * Handle connection status
     */
    private handleConnectionStatus;
    /**
     * Handle error
     */
    private handleError;
    /**
     * Emit event to listeners
     */
    private emitEvent;
    /**
     * Add event listener
     */
    on(event: string, listener: (data: any) => void): void;
    /**
     * Remove event listener
     */
    off(event: string, listener: (data: any) => void): void;
    /**
     * Get synchronization status
     */
    getSyncStatus(): Promise<ISyncStatus>;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): any;
    /**
     * Add document for synchronization
     */
    addDocumentForSync(documentId: string, filePath: string): Promise<void>;
    /**
     * Create collaboration session
     */
    createCollaborationSession(sessionId: string, permissions: any): Promise<void>;
    /**
     * Get collaboration sessions
     */
    getCollaborationSessions(): any[];
    /**
     * Subscribe to updates
     */
    subscribeToUpdates(target: string): Promise<void>;
    /**
     * Manually trigger synchronization
     */
    triggerSync(): Promise<void>;
    /**
     * Dispose synchronization service
     */
    dispose(): void;
    private generateCorrelationId;
    private validateDependencies;
    private connectToMountainWithRetry;
    private initializeDegradedMode;
    private validateEventListenerDependencies;
    private handleUIStateUpdateWithRetry;
    private handleConnectionStatusWithHealthCheck;
    private validateConflictResolutionPrerequisites;
    private getRemoteChange;
    private extractLineNumbers;
    private sanitizeConflictText;
    private executeWithTimeout;
    private performHealthCheck;
    private delay;
}
export declare const advancedSyncService: AdvancedSyncService;
//# sourceMappingURL=AdvancedSyncService.d.ts.map