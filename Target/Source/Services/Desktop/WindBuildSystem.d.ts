/**
 * Wind Build System Integration
 *
 * Advanced build system for Wind services that integrates with Maintain/Debug.sh
 * and Maintain/Release.sh scripts, providing comprehensive build, test, and
 * deployment capabilities for the Wind/Tauri ecosystem.
 *
 * Key Features:
 * - Integration with existing Maintain build scripts
 * - Comprehensive build pipeline with testing
 * - Defensive build patterns with graceful degradation
 * - Performance optimization and resource management
 */
/**
 * Build System Interface
 */
export interface IBuildSystem {
    buildDebug(): Promise<IBuildResult>;
    buildRelease(): Promise<IBuildResult>;
    runTests(): Promise<ITestResult>;
    runCoverage(): Promise<ICoverageResult>;
    deployDebug(): Promise<IDeployResult>;
    deployRelease(): Promise<IDeployResult>;
    monitorBuild(): Promise<IMonitorResult>;
    optimizeBuild(): Promise<IOptimizeResult>;
    cleanBuild(): Promise<void>;
    validateBuild(): Promise<IValidationResult>;
}
/**
 * Wind Build System Implementation
 */
export declare class WindBuildSystem implements IBuildSystem {
    private static instance;
    private isBuilding;
    private buildCache;
    private performanceMetrics;
    constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): WindBuildSystem;
    /**
     * Initialize build cache
     */
    private initializeBuildCache;
    /**
     * Build debug version
     */
    buildDebug(): Promise<IBuildResult>;
    /**
     * Build release version
     */
    buildRelease(): Promise<IBuildResult>;
    /**
     * Execute Maintain script
     */
    private executeMaintainScript;
    /**
     * Build Wind services
     */
    private buildWindServices;
    /**
     * Build individual service
     */
    private buildService;
    /**
     * Run tests
     */
    runTests(): Promise<ITestResult>;
    /**
     * Run comprehensive coverage tests
     */
    runCoverage(): Promise<ICoverageResult>;
    /**
     * Deploy debug version
     */
    deployDebug(): Promise<IDeployResult>;
    /**
     * Deploy release version
     */
    deployRelease(): Promise<IDeployResult>;
    /**
     * Monitor build process
     */
    monitorBuild(): Promise<IMonitorResult>;
    /**
     * Optimize build
     */
    optimizeBuild(): Promise<IOptimizeResult>;
    /**
     * Clean build artifacts
     */
    cleanBuild(): Promise<void>;
    /**
     * Validate build
     */
    validateBuild(): Promise<IValidationResult>;
    /**
     * Generate build ID
     */
    private generateBuildId;
    /**
     * Generate deployment ID
     */
    private generateDeploymentId;
    /**
     * Update build cache
     */
    private updateBuildCache;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Get memory usage
     */
    private getMemoryUsage;
    /**
     * Get CPU usage
     */
    private getCpuUsage;
    /**
     * Run integration tests
     */
    private runIntegrationTests;
    /**
     * Run performance tests
     */
    private runPerformanceTests;
    /**
     * Run comprehensive tests
     */
    private runComprehensiveTests;
    /**
     * Validate release build
     */
    private validateReleaseBuild;
}
/**
 * Interface definitions
 */
interface IBuildResult {
    buildId: string;
    configuration: string;
    success: boolean;
    duration: number;
    artifacts: string[];
    warnings: string[];
    errors: string[];
    performanceMetrics: {
        buildTime: number;
        memoryUsage: number;
        cpuUsage: number;
    };
}
interface ITestResult {
    success: boolean;
    testCount: number;
    passedCount: number;
    failedCount: number;
    coverage: number;
    duration: number;
    details: any;
}
interface ICoverageResult {
    coverage: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
    report: any;
}
interface IDeployResult {
    success: boolean;
    deploymentId: string;
    duration: number;
    artifacts: string[];
    warnings: string[];
    errors: string[];
}
interface IMonitorResult {
    isBuilding: boolean;
    performance: any;
    buildCache: IBuildCache[];
    successRate: number;
}
interface IOptimizeResult {
    success: boolean;
    duration: number;
    artifacts: string[];
    warnings: string[];
    errors: string[];
    optimizationLevel: string;
}
interface IValidationResult {
    isValid: boolean;
    duration: number;
    issues: string[];
    recommendations: string[];
}
interface IBuildCache {
    configuration: string;
    lastBuildTime: number;
    buildArtifacts: string[];
    success: boolean;
}
export declare const windBuildSystem: WindBuildSystem;
export {};
//# sourceMappingURL=WindBuildSystem.d.ts.map