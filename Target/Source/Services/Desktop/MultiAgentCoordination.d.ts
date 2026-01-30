/**
 * Multi-Agent Coordination System
 *
 * Advanced coordination system for Wind, Mountain, Cocoon, and Air agents
 * providing real-time synchronization, conflict resolution, and performance
 * monitoring across the entire ecosystem.
 *
 * Key Features:
 * - Real-time coordination between all agents
 * - Advanced conflict resolution across agents
 * - Performance monitoring and optimization
 * - Comprehensive error handling and recovery
 */
/**
 * Multi-Agent Coordination Interface
 */
export interface IMultiAgentCoordination {
    initializeAgents(): Promise<IAgentInitializationResult>;
    synchronizeAgents(): Promise<IAgentSynchronizationResult>;
    monitorAgents(): Promise<IAgentMonitoringResult>;
    resolveCrossAgentConflicts(conflicts: ICrossAgentConflict[]): Promise<IConflictResolutionResult>;
    optimizeAgentPerformance(): Promise<IPerformanceOptimizationResult>;
    handleAgentErrors(errors: IAgentError[]): Promise<IErrorHandlingResult>;
    getAgentStatus(): IAgentStatus;
    validateCoordination(): Promise<IValidationResult>;
}
/**
 * Multi-Agent Coordination Implementation
 */
export declare class MultiAgentCoordination implements IMultiAgentCoordination {
    private static instance;
    private agents;
    private coordinationCache;
    private isCoordinating;
    constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): MultiAgentCoordination;
    /**
     * Initialize agents map
     */
    private initializeAgentsMap;
    /**
     * Initialize coordination cache
     */
    private initializeCoordinationCache;
    /**
     * Initialize all agents
     */
    initializeAgents(): Promise<IAgentInitializationResult>;
    /**
     * Initialize Wind agent
     */
    private initializeWindAgent;
    /**
     * Initialize Mountain agent
     */
    private initializeMountainAgent;
    /**
     * Initialize Cocoon agent
     */
    private initializeCocoonAgent;
    /**
     * Initialize Air agent
     */
    private initializeAirAgent;
    /**
     * Set up cross-agent communication
     */
    private setupCrossAgentCommunication;
    /**
     * Synchronize all agents
     */
    synchronizeAgents(): Promise<IAgentSynchronizationResult>;
    /**
     * Monitor all agents
     */
    monitorAgents(): Promise<IAgentMonitoringResult>;
    /**
     * Resolve cross-agent conflicts
     */
    resolveCrossAgentConflicts(conflicts: ICrossAgentConflict[]): Promise<IConflictResolutionResult>;
    /**
     * Optimize agent performance
     */
    optimizeAgentPerformance(): Promise<IPerformanceOptimizationResult>;
    /**
     * Handle agent errors
     */
    handleAgentErrors(errors: IAgentError[]): Promise<IErrorHandlingResult>;
    /**
     * Get agent status
     */
    getAgentStatus(): IAgentStatus;
    /**
     * Validate coordination
     */
    validateCoordination(): Promise<IValidationResult>;
    /**
     * Generate coordination ID
     */
    private generateCoordinationId;
    /**
     * Update agent status
     */
    private updateAgentStatus;
    /**
     * Get cache timestamp
     */
    private getCacheTimestamp;
    private handleMountainToWindMessage;
    private handleCocoonToWindMessage;
    private handleAirToWindMessage;
    private handleAgentBroadcast;
}
/**
 * Interface definitions
 */
interface IAgent {
    id: string;
    name: string;
    type: string;
    status: string;
    capabilities: string[];
    dependencies: string[];
    lastHeartbeat: number;
}
interface ICoordinationCache {
    type: string;
    lastSyncTime?: number;
    lastCheckTime?: number;
    lastErrorTime?: number;
    successRate?: number;
    conflicts?: any[];
    metrics?: any;
    optimizations?: any[];
    errorCount?: number;
    resolutions?: any[];
}
interface IAgentInitializationResult {
    success: boolean;
    duration: number;
    capabilities: string[];
    dependencies: string[];
    metrics: any;
}
interface IAgentSynchronizationResult {
    success: boolean;
    duration: number;
    agentResults: Record<string, any>;
    coordinationId: string;
    conflicts: any[];
}
interface IAgentMonitoringResult {
    timestamp: number;
    agentStatuses: Record<string, IAgentStatus>;
    coordinationStatus: ICoordinationCache[];
    isCoordinating: boolean;
}
interface IConflictResolutionResult {
    resolvedConflicts: any[];
    unresolvedConflicts: any[];
    duration: number;
    successRate: number;
}
interface IPerformanceOptimizationResult {
    success: boolean;
    duration: number;
    optimizations: any[];
    performanceImprovement: number;
}
interface IErrorHandlingResult {
    handledErrors: any[];
    unhandledErrors: any[];
    duration: number;
    successRate: number;
}
interface IAgentStatus {
    timestamp: number;
    agents: IAgent[];
    coordination: {
        isCoordinating: boolean;
        lastCoordinationTime: number;
        coordinationCache: ICoordinationCache[];
    };
}
interface ICrossAgentConflict {
    id: string;
    agents: string[];
    type: string;
    severity: string;
    description: string;
}
interface IAgentError {
    id: string;
    agent: string;
    type: string;
    message: string;
    timestamp: number;
}
export declare const multiAgentCoordination: MultiAgentCoordination;
export {};
//# sourceMappingURL=MultiAgentCoordination.d.ts.map