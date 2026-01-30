/**
 * Wind Build Integration System
 *
 * Advanced integration system that connects Wind services with the existing
 * Maintain build system, providing comprehensive build, test, and deployment
 * capabilities with VSCode workbench compatibility.
 *
 * Key Features:
 * - Integration with Maintain/Debug.sh and Maintain/Release.sh
 * - Comprehensive build pipeline with Turbo integration
 * - Defensive build patterns with graceful degradation
 * - Performance optimization and resource management
 */
/**
 * Wind Build Integration Interface
 */
export interface IWindBuildIntegration {
    buildWithMaintain(configuration: 'debug' | 'release'): Promise<IBuildResult>;
    runIntegrationTests(): Promise<IIntegrationTestResult>;
    runCoverageAnalysis(): Promise<ICoverageAnalysisResult>;
    deployWithMaintain(configuration: 'debug' | 'release'): Promise<IDeploymentResult>;
    monitorIntegration(): Promise<IIntegrationMonitorResult>;
    validateIntegration(): Promise<IValidationResult>;
    optimizeIntegration(): Promise<IOptimizationResult>;
}
/**
 * Wind Build Integration Implementation
 */
export declare class WindBuildIntegration implements IWindBuildIntegration {
    private static instance;
    private isIntegrating;
    private integrationCache;
    constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): WindBuildIntegration;
    /**
     * Initialize integration cache
     */
    private initializeIntegrationCache;
    /**
     * Build with Maintain integration
     */
    buildWithMaintain(configuration: 'debug' | 'release'): Promise<IBuildResult>;
    /**
     * Execute Maintain build script
     */
    private executeMaintainBuildScript;
    /**
     * Build Wind services
     */
    private buildWindServices;
    /**
     * Run integration tests
     */
    runIntegrationTests(): Promise<IIntegrationTestResult>;
    /**
     * Run coverage analysis
     */
    runCoverageAnalysis(): Promise<ICoverageAnalysisResult>;
    /**
     * Deploy with Maintain integration
     */
    deployWithMaintain(configuration: 'debug' | 'release'): Promise<IDeploymentResult>;
    /**
     * Monitor integration
     */
    monitorIntegration(): Promise<IIntegrationMonitorResult>;
    /**
     * Validate integration
     */
    validateIntegration(): Promise<IValidationResult>;
    /**
     * Optimize integration
     */
    optimizeIntegration(): Promise<IOptimizationResult>;
    /**
     * Test VSCode workbench adapter
     */
    private testVSCodeWorkbenchAdapter;
    /**
     * Test Wind services integration
     */
    private testWindServicesIntegration;
    /**
     * Validate VSCode workbench adapter
     */
    private validateVSCodeWorkbenchAdapter;
    /**
     * Validate Wind services
     */
    private validateWindServices;
    /**
     * Validate integration cache
     */
    private validateIntegrationCache;
    /**
     * Test AdvancedSyncService
     */
    private testAdvancedSyncService;
    /**
     * Test ConflictResolutionService
     */
    private testConflictResolutionService;
    /**
     * Test PerformanceDashboardService
     */
    private testPerformanceDashboardService;
    /**
     * Generate integration ID
     */
    private generateIntegrationId;
    /**
     * Generate deployment ID
     */
    private generateDeploymentId;
    /**
     * Update integration cache
     */
    private updateIntegrationCache;
    /**
     * Calculate integration score
     */
    private calculateIntegrationScore;
    /**
     * Get memory usage
     */
    private getMemoryUsage;
    /**
     * Get CPU usage
     */
    private getCpuUsage;
}
/**
 * Interface definitions
 */
interface IBuildResult {
    integrationId: string;
    configuration: string;
    success: boolean;
    duration: number;
    artifacts: string[];
    warnings: string[];
    errors: string[];
    performance: {
        buildTime: number;
        memoryUsage: number;
        cpuUsage: number;
        integrationScore: number;
    };
}
interface IIntegrationTestResult {
    success: boolean;
    testCount: number;
    passedCount: number;
    failedCount: number;
    coverage: number;
    duration: number;
    details: any;
}
interface ICoverageAnalysisResult {
    coverage: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
    report: any;
}
interface IDeploymentResult {
    success: boolean;
    deploymentId: string;
    duration: number;
    artifacts: string[];
    warnings: string[];
    errors: string[];
}
interface IIntegrationMonitorResult {
    isIntegrating: boolean;
    buildStatus: any;
    coverageStatus: any;
    integrationCache: IIntegrationCache[];
}
interface IValidationResult {
    isValid: boolean;
    duration: number;
    issues: string[];
    recommendations: string[];
}
interface IOptimizationResult {
    success: boolean;
    duration: number;
    artifacts: string[];
    warnings: string[];
    errors: string[];
    optimizationLevel: string;
}
interface IIntegrationCache {
    configuration: string;
    lastIntegrationTime: number;
    success: boolean;
    artifacts: string[];
}
export declare const windBuildIntegration: WindBuildIntegration;
export {};
//# sourceMappingURL=WindBuildIntegration.d.ts.map