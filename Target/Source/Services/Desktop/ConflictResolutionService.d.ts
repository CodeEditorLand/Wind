/**
 * Advanced Conflict Resolution Service
 *
 * Implements sophisticated conflict resolution algorithms for real-time collaboration
 * based on Mountain's WindAdvancedSync.rs conflict handling capabilities
 */
export interface IConflictResolution {
    resolveConflicts(documentId: string, conflicts: IDocumentConflict[]): Promise<IConflictResolutionResult>;
    autoResolveSimpleConflicts(conflicts: IDocumentConflict[]): IDocumentConflict[];
    suggestResolutionStrategies(conflicts: IDocumentConflict[]): IResolutionStrategy[];
    applyResolutionStrategy(strategy: IResolutionStrategy): Promise<void>;
}
export interface IDocumentChange {
    changeId: string;
    documentId: string;
    changeType: string;
    content: any;
    timestamp: number;
    applied: boolean;
}
export interface IDocumentConflict {
    conflictId: string;
    documentId: string;
    changeType: string;
    localChange: IDocumentChange;
    remoteChange: IDocumentChange;
    timestamp: number;
    severity: ConflictSeverity;
    context: IConflictContext;
    resolutionStrategy?: string;
}
export interface IConflictContext {
    lineNumbers: number[];
    conflictingText: string;
    author: string;
    lastResolvedBy?: string;
}
export declare enum ConflictSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface IConflictResolutionResult {
    resolvedConflicts: IDocumentConflict[];
    unresolvedConflicts: IDocumentConflict[];
    resolutionStrategy: string;
    confidence: number;
    timeSpent: number;
}
export interface IResolutionMetric {
    documentId: string;
    timestamp: number;
    totalConflicts: number;
    resolvedConflicts: number;
    resolutionStrategy: string;
    confidence: number;
    timeSpent: number;
}
export interface IConflictPattern {
    totalConflicts: number;
    simpleConflicts: number;
    complexConflicts: number;
    criticalConflicts: number;
}
export interface IResolutionStrategy {
    strategyId: string;
    name: string;
    description: string;
    confidence: number;
    actions: IResolutionAction[];
}
export interface IResolutionAction {
    action: string;
    target: string;
    parameters: any;
}
export declare class ConflictResolutionService implements IConflictResolution {
    private static instance;
    private conflictHistory;
    private resolutionStrategies;
    private resolutionMetrics;
    private errorHandler;
    private performanceMonitor;
    private config;
    constructor(config?: Partial<IConflictResolutionConfig>);
    /**
     * Get singleton instance
     */
    static getInstance(): ConflictResolutionService;
    /**
     * Initialize resolution strategies
     */
    private initializeStrategies;
    /**
     * Resolve conflicts with production standards and advanced algorithms
     */
    resolveConflicts(documentId: string, conflicts: IDocumentConflict[]): Promise<IConflictResolutionResult>;
    /**
     * Auto-resolve simple conflicts
     */
    autoResolveSimpleConflicts(conflicts: IDocumentConflict[]): IDocumentConflict[];
    /**
     * Check if conflict involves only whitespace changes
     */
    private isWhitespaceConflict;
    /**
     * Check if conflict involves only comment changes
     */
    private isCommentConflict;
    /**
     * Suggest resolution strategies
     */
    suggestResolutionStrategies(conflicts: IDocumentConflict[]): IResolutionStrategy[];
    /**
     * Analyze conflict patterns
     */
    private analyzeConflictPattern;
    /**
     * Apply resolution strategy with production standards
     */
    applyResolutionStrategy(strategy: IResolutionStrategy, correlationId: string): Promise<void>;
    /**
     * Execute resolution action
     */
    private executeResolutionAction;
    /**
     * Apply strategy to conflicts
     */
    private applyStrategy;
    /**
     * Choose best resolution from results
     */
    private chooseBestResolution;
    /**
     * Get resolution metrics
     */
    getResolutionMetrics(): IResolutionMetric[];
    /**
     * Get conflict history
     */
    getConflictHistory(documentId: string): IDocumentConflict[];
    private generateCorrelationId;
    private validateConflictInput;
    private executeWithTimeout;
    private applyStrategyWithMonitoring;
    private validateStrategyPrerequisites;
    private isActionSupported;
    private executeResolutionActionWithMonitoring;
}
interface IConflictResolutionConfig {
    enableSmartMerge: boolean;
    enableAutoResolution: boolean;
    maxResolutionTimeMs: number;
    enablePerformanceTracking: boolean;
}
export declare const conflictResolutionService: ConflictResolutionService;
export {};
//# sourceMappingURL=ConflictResolutionService.d.ts.map