/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeLoggerType
 * @description
 * Logger-related types for VSCode.
 * @category Type
 */

import type { Event, IDisposable } from "./VSCodeCommonType.js";

/**
 * Log level enum
 */
export enum LogLevel {
	Trace = 0,
	Debug = 1,
	Info = 2,
	Warning = 3,
	Error = 4,
	Critical = 5,
	Off = 6,
}

/**
 * Logger options interface
 */
export interface ILoggerOptions {
	name?: string;
	logLevel?: LogLevel;
}

/**
 * Logger interface
 */
export interface ILogger {
	trace(message: string, ...args: any[]): void;
	debug(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
	critical(message: string, ...args: any[]): void;
}

// Re-export common types for convenience
export type { Event, IDisposable };
