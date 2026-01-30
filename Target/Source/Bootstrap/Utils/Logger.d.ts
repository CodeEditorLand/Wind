/**
 * @module Bootstrap/Utils/Logger
 * @description
 * Enhanced logging utility with VSCode integration.
 */
export declare class Logger {
    private static instance;
    private platform;
    private isDebugMode;
    private logs;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): Logger;
    /**
     * Log a trace message
     */
    trace(message: string, data?: any): void;
    /**
     * Log a debug message
     */
    debug(message: string, data?: any): void;
    /**
     * Log an info message
     */
    info(message: string, data?: any): void;
    /**
     * Log a warning message
     */
    warn(message: string, data?: any): void;
    /**
     * Log an error message
     */
    error(message: string, data?: any): void;
    /**
     * Log a critical message
     */
    critical(message: string, data?: any): void;
    /**
     * Internal log method
     */
    private log;
    /**
     * Integrate with VSCode logging
     */
    private integrateWithVSCode;
    /**
     * Map bootstrap log level to VSCode log level
     */
    private mapToVSCodeLevel;
    /**
     * Get all logs
     */
    getLogs(): Array<{
        timestamp: number;
        level: string;
        message: string;
        data?: any;
    }>;
    /**
     * Get logs by level
     */
    getLogsByLevel(level: string): Array<{
        timestamp: number;
        message: string;
        data?: any;
    }>;
    /**
     * Export logs as JSON
     */
    exportLogs(): string;
    /**
     * Clear all logs
     */
    clearLogs(): void;
    /**
     * Get log statistics
     */
    getStatistics(): {
        total: number;
        byLevel: Record<string, number>;
        firstTimestamp: number;
        lastTimestamp: number;
    };
    /**
     * Create a logger with prefix
     */
    createWithPrefix(prefix: string): {
        trace: (message: string, data?: any) => void;
        debug: (message: string, data?: any) => void;
        info: (message: string, data?: any) => void;
        warn: (message: string, data?: any) => void;
        error: (message: string, data?: any) => void;
        critical: (message: string, data?: any) => void;
    };
}
//# sourceMappingURL=Logger.d.ts.map