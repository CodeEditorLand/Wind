/**
 * @module Bootstrap/Utils/Logger
 * @description
 * Enhanced logging utility with VSCode integration.
 */

import type { Platform } from "../Types/Types.js";

export class Logger {
	private static instance: Logger;
	private platform: Platform;
	private isDebugMode: boolean;
	private logs: Array<{
		timestamp: number;
		level: "trace" | "debug" | "info" | "warn" | "error" | "critical";
		message: string;
		data?: any;
	}> = [];

	private constructor() {
		this.platform = (window as any).__BOOTSTRAP_PLATFORM__ || "browser";
		this.isDebugMode = (window as any).__BOOTSTRAP_DEBUG__ || false;
	}

	/**
	 * Get the singleton instance
	 */
	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	/**
	 * Log a trace message
	 */
	trace(message: string, data?: any): void {
		if (!this.isDebugMode) return;

		this.log("trace", message, data);
		console.trace(`[TRACE] ${message}`, data);
	}

	/**
	 * Log a debug message
	 */
	debug(message: string, data?: any): void {
		if (!this.isDebugMode) return;

		this.log("debug", message, data);
		console.debug(`[DEBUG] ${message}`, data);
	}

	/**
	 * Log an info message
	 */
	info(message: string, data?: any): void {
		this.log("info", message, data);
		console.info(`[INFO] ${message}`, data);
	}

	/**
	 * Log a warning message
	 */
	warn(message: string, data?: any): void {
		this.log("warn", message, data);
		console.warn(`[WARN] ${message}`, data);
	}

	/**
	 * Log an error message
	 */
	error(message: string, data?: any): void {
		this.log("error", message, data);
		console.error(`[ERROR] ${message}`, data);
	}

	/**
	 * Log a critical message
	 */
	critical(message: string, data?: any): void {
		this.log("critical", message, data);
		console.error(`[CRITICAL] ${message}`, data);
	}

	/**
	 * Internal log method
	 */
	private log(
		level: "trace" | "debug" | "info" | "warn" | "error" | "critical",
		message: string,
		data?: any,
	): void {
		const timestamp = performance.now();

		this.logs.push({
			timestamp,
			level,
			message,
			data,
		});

		// Integrate with VSCode logging if available
		this.integrateWithVSCode(level, message, data);

		// Keep only last 1000 logs
		if (this.logs.length > 1000) {
			this.logs = this.logs.slice(-1000);
		}
	}

	/**
	 * Integrate with VSCode logging
	 */
	private integrateWithVSCode(
		level: string,
		message: string,
		data?: any,
	): void {
		const vscode = (window as any).vscode;

		if (vscode && vscode.logger) {
			try {
				const vscodeLevel = this.mapToVSCodeLevel(level);
				vscode.logger[vscodeLevel](`[Bootstrap] ${message}`, data);
			} catch (error) {
				// VSCode logger not available, fallback to console
				console.log(
					`[Bootstrap] ${level.toUpperCase()}: ${message}`,
					data,
				);
			}
		}
	}

	/**
	 * Map bootstrap log level to VSCode log level
	 */
	private mapToVSCodeLevel(level: string): string {
		switch (level) {
			case "trace":
				return "trace";
			case "debug":
				return "debug";
			case "info":
				return "info";
			case "warn":
				return "warn";
			case "error":
				return "error";
			case "critical":
				return "critical";
			default:
				return "info";
		}
	}

	/**
	 * Get all logs
	 */
	getLogs(): Array<{
		timestamp: number;
		level: string;
		message: string;
		data?: any;
	}> {
		return [...this.logs];
	}

	/**
	 * Get logs by level
	 */
	getLogsByLevel(level: string): Array<{
		timestamp: number;
		message: string;
		data?: any;
	}> {
		return this.logs.filter((log) => log.level === level);
	}

	/**
	 * Export logs as JSON
	 */
	exportLogs(): string {
		return JSON.stringify(this.logs, null, 2);
	}

	/**
	 * Clear all logs
	 */
	clearLogs(): void {
		this.logs = [];
	}

	/**
	 * Get log statistics
	 */
	getStatistics(): {
		total: number;
		byLevel: Record<string, number>;
		firstTimestamp: number;
		lastTimestamp: number;
	} {
		const byLevel: Record<string, number> = {};

		this.logs.forEach((log) => {
			byLevel[log.level] = (byLevel[log.level] || 0) + 1;
		});

		return {
			total: this.logs.length,
			byLevel,
			firstTimestamp: this.logs[0]?.timestamp || 0,
			lastTimestamp: this.logs[this.logs.length - 1]?.timestamp || 0,
		};
	}

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
	} {
		return {
			trace: (message: string, data?: any) =>
				this.trace(`[${prefix}] ${message}`, data),
			debug: (message: string, data?: any) =>
				this.debug(`[${prefix}] ${message}`, data),
			info: (message: string, data?: any) =>
				this.info(`[${prefix}] ${message}`, data),
			warn: (message: string, data?: any) =>
				this.warn(`[${prefix}] ${message}`, data),
			error: (message: string, data?: any) =>
				this.error(`[${prefix}] ${message}`, data),
			critical: (message: string, data?: any) =>
				this.critical(`[${prefix}] ${message}`, data),
		};
	}
}
