/**
 * Wind Service Coverage and Defensive Implementation
 *
 * Comprehensive coverage testing and defensive patterns for Wind services
 * ensuring VSCode workbench compatibility with selective and defensive implementation.
 *
 * Key Features:
 * - Coverage testing for all VSCode workbench APIs
 * - Defensive error handling with graceful degradation
 * - Selective implementation based on Wind/Tauri capabilities
 * - Performance monitoring and optimization
 */
/**
 * Coverage Testing Interface
 */
export interface ICoverageTest {
    name: string;
    description: string;
    testFunction: () => Promise<boolean>;
    priority: 'critical' | 'high' | 'medium' | 'low';
    dependencies: string[];
    timeout: number;
}
/**
 * Defensive Implementation Patterns
 */
export interface IDefensivePattern {
    patternId: string;
    name: string;
    description: string;
    implementation: (target: any, ...args: any[]) => Promise<any>;
    fallback: (error: Error, target: any, ...args: any[]) => Promise<any>;
    validation: (result: any) => boolean;
}
/**
 * Wind Service Coverage Manager
 */
export declare class WindServiceCoverage {
    private static instance;
    private coverageTests;
    private defensivePatterns;
    private testResults;
    private isTesting;
    constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): WindServiceCoverage;
    /**
     * Initialize comprehensive coverage tests
     */
    private initializeCoverageTests;
    /**
     * Initialize defensive implementation patterns
     */
    private initializeDefensivePatterns;
    /**
     * Add coverage test
     */
    private addCoverageTest;
    /**
     * Add defensive pattern
     */
    private addDefensivePattern;
    /**
     * Run comprehensive coverage tests
     */
    runCoverageTests(): Promise<ICoverageReport>;
    /**
     * Group tests by priority
     */
    private groupTestsByPriority;
    /**
     * Run single coverage test
     */
    private runSingleTest;
    /**
     * Check if dependency is available
     */
    private isDependencyAvailable;
    /**
     * Apply defensive pattern to function call
     */
    applyDefensivePattern(patternId: string, target: any, ...args: any[]): Promise<any>;
    /**
     * Get defensive patterns
     */
    getDefensivePatterns(): IDefensivePattern[];
    /**
     * Get coverage tests
     */
    getCoverageTests(): ICoverageTest[];
    /**
     * Get test results
     */
    getTestResults(): ITestResult[];
}
/**
 * Interface definitions
 */
interface ICoverageReport {
    timestamp: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    testResults: ITestResult[];
    coveragePercentage: number;
}
interface ITestResult {
    testName: string;
    passed: boolean;
    error?: string;
    duration: number;
    timestamp: number;
}
export declare const windServiceCoverage: WindServiceCoverage;
export {};
//# sourceMappingURL=WindServiceCoverage.d.ts.map