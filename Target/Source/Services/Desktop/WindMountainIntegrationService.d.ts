/**
 * @module WindMountainIntegrationService
 * @description
 * Comprehensive integration service that orchestrates all Wind-Mountain synchronization.
 * This is the central coordinator for advanced desktop functionality.
 *
 * Features:
 * - Orchestrates all synchronization services
 * - Manages lifecycle of Wind-Mountain integration
 * - Provides unified API for desktop features
 * - Handles error recovery and fallback mechanisms
 * - Monitors integration health
 */
/**
 * Comprehensive Wind-Mountain integration service
 */
export declare class WindMountainIntegrationService {
    private static instance;
    private isInitialized;
    private integrationStatus;
    private serviceHealth;
    private errorHandlers;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): WindMountainIntegrationService;
    /**
     * Initialize comprehensive Wind-Mountain integration
     */
    initialize(): Promise<void>;
    /**
     * Initialize integration status
     */
    private initializeIntegrationStatus;
    /**
     * Set up error handling
     */
    private setupErrorHandling;
    /**
     * Set up health monitoring
     */
    private setupHealthMonitoring;
    /**
     * Set up lifecycle management
     */
    private setupLifecycleManagement;
    /**
     * Check Mountain connection
     */
    private checkMountainConnection;
    /**
     * Check IPC communication
     */
    private checkIpcCommunication;
    /**
     * Check service health
     */
    private checkServiceHealth;
    /**
     * Check performance
     */
    private checkPerformance;
    /**
     * Handle Mountain error
     */
    private handleMountainError;
    /**
     * Recover from IPC error
     */
    private recoverFromIpcError;
    /**
     * Recover from Mountain error
     */
    private recoverFromMountainError;
    /**
     * Recover from document sync error
     */
    private recoverFromDocumentSyncError;
    /**
     * Handle Mountain restart
     */
    private handleMountainRestart;
    /**
     * Handle connection loss
     */
    private handleConnectionLoss;
    /**
     * Handle connection restored
     */
    private handleConnectionRestored;
    /**
     * Cleanup integration
     */
    cleanup(): Promise<void>;
    /**
     * Get integration status
     */
    getIntegrationStatus(): IntegrationStatus;
    /**
     * Get service health
     */
    getServiceHealth(): Map<string, ServiceHealth>;
    /**
     * Add document for synchronization
     */
    addDocumentForSync(documentId: string, filePath: string): Promise<void>;
    /**
     * Create collaboration session
     */
    createCollaborationSession(sessionId: string, permissions: CollaborationPermissions): Promise<void>;
    /**
     * Subscribe to updates
     */
    subscribeToUpdates(target: string): Promise<void>;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): PerformanceStats;
    /**
     * Get collaboration sessions
     */
    getCollaborationSessions(): CollaborationSession[];
    /**
     * Track performance metrics
     */
    trackPerformanceMetrics(metrics: any): Promise<void>;
    /**
     * Track error
     */
    trackError(error: Error, context?: any): Promise<void>;
    /**
     * Send analytics event
     */
    sendAnalyticsEvent(eventName: string, eventData?: any): Promise<void>;
}
interface IntegrationStatus {
    overall: 'connected' | 'disconnected' | 'error';
    mountainConnection: 'connected' | 'disconnected' | 'error';
    ipcCommunication: 'connected' | 'disconnected' | 'error';
    documentSync: 'enabled' | 'disabled' | 'conflicted' | 'error';
    uiStateSync: 'enabled' | 'disabled' | 'error';
    performanceMonitoring: 'enabled' | 'disabled' | 'error';
    lastHealthCheck: number;
    uptime: number;
}
interface ServiceHealth {
    status: 'healthy' | 'unhealthy' | 'degraded';
    lastCheck: number;
    responseTime?: number;
    error?: string;
    metrics?: any;
}
interface CollaborationPermissions {
    canEdit: boolean;
    canView: boolean;
    canComment: boolean;
    canShare: boolean;
}
interface CollaborationSession {
    sessionId: string;
    participants: string[];
    activeDocuments: string[];
    lastActivity: number;
    permissions: CollaborationPermissions;
}
interface PerformanceStats {
    totalMessagesSent: number;
    totalMessagesReceived: number;
    averageProcessingTimeMs: number;
    peakMessageRate: number;
    errorCount: number;
    lastUpdate: number;
    connectionUptime: number;
}
export declare const windMountainIntegrationService: WindMountainIntegrationService;
export {};
//# sourceMappingURL=WindMountainIntegrationService.d.ts.map