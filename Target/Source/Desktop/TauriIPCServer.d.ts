/**
 * @module TauriIPCServer
 * @description
 * Tauri IPC Server implementation for VSCode workbench integration.
 * Replaces Electron's IPC server with Tauri's message passing system.
 *
 * Architecture:
 * - Uses Tauri's invoke/event system for bidirectional communication
 * - Maps VSCode IPC channels to Tauri message handlers
 * - Provides seamless integration with Wind services
 *
 * TODO: Complete implementation of all IPC channels
 * TODO: Implement proper error handling and reconnection logic
 * TODO: Add performance monitoring and optimization
 */
/**
 * Tauri IPC Server implementation
 */
export declare class TauriIPCServer {
    private listeners;
    private isConnected;
    private messageQueue;
    constructor();
    /**
     * Set up Tauri event listeners for IPC communication with Mountain integration
     */
    private setupListeners;
    /**
     * Handle incoming IPC messages
     */
    private handleIncomingMessage;
    /**
     * Handle connection status changes
     */
    private handleConnectionStatus;
    /**
     * Send message via Tauri IPC
     */
    send(channel: string, data: any): Promise<void>;
    /**
     * Register listener for IPC channel
     */
    on(channel: string, listener: (data: any) => void): void;
    /**
     * Remove listener from IPC channel
     */
    off(channel: string, listener: (data: any) => void): void;
    /**
     * Process queued messages
     */
    private processMessageQueue;
    /**
     * Get connection status
     */
    getConnectionStatus(): boolean;
    /**
     * Get queued message count
     */
    getQueueSize(): number;
    /**   * Set up channel listener with error handling and retry logic
     */
    private setupChannelListener;
    /**
     * Handle advanced sync events from Mountain
     */
    private handleAdvancedSyncEvent;
    /**
     * Verify Mountain connection status
     */
    private verifyMountainConnection;
    /**
     * Handle document synchronization from Mountain
     */
    private handleDocumentSync;
    /**
     * Handle UI state synchronization from Mountain
     */
    private handleUIStateSync;
    /**
     * Handle performance metrics from Mountain
     */
    private handlePerformanceMetrics;
    /**   * Cleanup resources
     */
    dispose(): void;
}
export declare const tauriIPCServer: TauriIPCServer;
//# sourceMappingURL=TauriIPCServer.d.ts.map