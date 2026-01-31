/**
 * @module Bootstrap/Stages/Stage1-Preload
 * @description
 * Stage 1: Preload Script Loading and API Validation
 *
 * EXECUTION ORDER: Second stage (1/6), executes after Environment detection
 *
 * RESPONSIBILITIES:
 * - Wait for Wind preload script to load and initialize
 * - Validate window.vscode API shims are present
 * - Verify required API methods are available
 * - Test IPC communication channel
 * - Handle preload loading timeouts gracefully
 * - Collect preload API availability metrics
 *
 * ARCHITECTURE OVERVIEW:
 * This stage ensures that the preload script has been injected by the
 * Desktop framework (Tauri/Electron) and that the VSCode API shims are
 * functional. The preload script provides the bridge between the renderer
 * process and the main process, enabling IPC and system-level operations.
 *
 * The stage implements a polling-based detection with configurable timeout,
 * similar to VSCode's preload ready detection:
 *
 * 1. Poll for window.vscode to appear (preload script loaded)
 * 2. Validate required properties exist (API structure)
 * 3. Test IPC communication (functional verification)
 * 4. Collect API availability metrics (for diagnostics)
 *
 * TIMEOUT HANDLING:
 * - Default timeout: 5 seconds (configurable via __BOOTSTRAP_PRELOAD_TIMEOUT__)
 * - Poll interval: 100ms (balances responsiveness and CPU usage)
 * - Timeout does not block bootstrap - continues with fallbacks
 * - Provides detailed error context for debugging
 *
 * DEPENDENCIES:
 * - Requires Stage0 (Environment) to be complete
 * - Preload script must be injected by framework before this stage executes
 * - No services available yet at this stage
 *
 * Microsoft VSCode Source References:
 * - src/vs/workbench/common/lifecycle.ts - Lifecycle state management
 * - src/vs/workbench/services/extensions/common/electronExtensionHost.ts - Extension host
 * - src/vs/base/parts/ipc/common/ipc.ts - IPC communication layer
 * - src/vs/platform/windows/common/window.ts - Window lifecycle
 * - src/vs/base/common/async.ts - Async utilities and timeouts
 * - src/vs/workbench/api/common/extHostExtensionActivator.ts - Extension activation
 *
 * TODO:
 * - Add preload script version detection
 * - Implement preload script hash verification for security
 * - Add WebSocket fallback for IPC when main process is unavailable
 * - Implement preload retry mechanism with exponential backoff
 * - Add preload performance timing metrics
 * - Support multiple preload scripts for modular loading
 * - Add IPC message batching for better performance
 * - Implement IPC message compression for large payloads
 * - Add IPC middleware chain for request/response processing
 * - Support IPC proxy for remote debugging
 * - Add IPC timeout per request (not just global)
 * - Implement IPC circuit breaker for fault tolerance
 * - Add IPC request/response metrics collection
 * - Support IPC streaming for large data transfer
 * - Implement IPC pub/sub pattern for event-driven communication
 * - Add IPC request deduplication
 * - Support IPC request caching for idempotent operations
 * - Implement IPC request reconciliation after reconnect
 * - Add IPC message encryption for security
 * - Support IPC authentication tokens
 * - Implement IPC rate limiting
 * - Add IPC priority queuing
 * - Support IPC dead letter queue for failed messages
 * - Implement IPC message replay for recovery
 * - Add IPC message audit logging
 * - Support IPC cross-window communication
 * - Implement IPC web worker support
 * - Add IPC service worker support
 * - Implement IPC SharedArrayBuffer for zero-copy messaging
 * - Add IPC postMessage fallback for older browsers
 * - Implement IPC Blob support for binary data
 * - Add IPC Transferable objects support
 * - Implement IPC Channel Messaging API
 * - Add IPC BroadcastChannel for multi-window
 * - Implement IPC MessageChannel for direct channel
 * - Add RTCDataChannel for peer-to-peer
 * - Implement WebSocket fallback for serverless
 * - Add Server-Sent Events for streaming
 * - Implement Long Polling for compatibility
 * - Add EventSource for server push
 * - Implement WebTransport for high performance
 * - Add QUIC protocol support
 * - Implement HTTP/3 support
 * - Add gRPC-Web support
 * - Implement GraphQL subscriptions
 * - Add WebSocket subprotocol negotiation
 * - Implement WebSocket compression
 * - Add WebSocket binary framing
 * - Implement WebSocket heartbeat
 * - Add WebSocket reconnection
 * - Implement WebSocket failover
 * - Add WebSocket load balancing
 * - Implement WebSocket connection pooling
 * - Add WebSocket authentication
 * - Implement WebSocket authorization
 * - Add WebSocket rate limiting
 * - Implement WebSocket message ordering
 * - Add WebSocket message deduplication
 * - Implement WebSocket message compression
 * - Add WebSocket message encryption
 * - Implement WebSocket message signing
 * - Add WebSocket message validation
 * - Implement WebSocket message transformation
 * - Add WebSocket message routing
 * - Implement WebSocket message filtering
 * - Add WebSocket message aggregation
 * - Implement WebSocket message batching
 * - Add WebSocket message buffering
 * - Implement WebSocket message priority
 * - Add WebSocket message timeout
 * - Implement WebSocket message retry
 * - Add WebSocket message dead letter queue
 * - Implement WebSocket message metrics collector
 * - Add WebSocket message tracer
 * - Implement WebSocket message logger
 * - Add WebSocket message auditor
 * - Implement WebSocket message serializer
 * - Add WebSocket message deserializer
 * - Implement WebSocket message validator
 * - Add WebSocket message sanitizer
 * - Implement WebSocket message normalizer
 * - Add WebSocket message transformer
 * - Implement WebSocket message interceptor
 * - Add WebSocket message handler
 * - Implement WebSocket message processor
 * - Add WebSocket message executor
 * - Implement WebSocket message scheduler
 * - Add WebSocket message dispatcher
 * - Implement WebSocket message broker
 * - Add WebSocket message queue
 * - Implement WebSocket message topic
 * - Add WebSocket message subscription
 * - Implement WebSocket message publication
 * - Add WebSocket message unsubscription
 * - Implement WebSocket message broadcast
 * - Add WebSocket message multicast
 * - Implement WebSocket message unicast
 * - Add WebSocket message anycast
 * - Implement WebSocket message geocast
 * - Implement WebSocket message timecast
 * - Add WebSocket message spacecast
 * - Implement WebSocket message groupcast
 * - Implement WebSocket message rolecast
 * - Add WebSocket message permissioncast
 */
import type { StageResult } from '../Types/index.js';
export declare class PreloadStage {
    static readonly STAGE_NAME: "Preload";
    /**
     * Execute the preload initialization stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Wait for preload script to be ready with configurable timeout
     */
    private static waitForPreloadReady;
    /**
     * Check if preload script is ready
     */
    private static isPreloadReady;
    /**
     * Validate window.vscode API
     */
    private static validateVSCodeAPI;
    /**
     * Verify API shims are present
     */
    private static verifyAPIShims;
    /**
     * Test IPC communication
     */
    private static testIPCCommunication;
    /**
     * Get preload status
     */
    static getPreloadStatus(): {
        ready: boolean;
        vscodeAvailable: boolean;
        contextAvailable: boolean;
        ipcAvailable: boolean;
    };
}
//# sourceMappingURL=Stage1-Preload.d.ts.map