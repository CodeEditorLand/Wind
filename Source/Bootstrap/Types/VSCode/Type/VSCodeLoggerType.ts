/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeLoggerType
 * @description
 * Logger-related types for VSCode logging service.
 * @see {@link Bootstrap/Types/VSCode/Interface/VSCodeLoggerService} Related service interface
 * @category Type
 */

import type { Event, IDisposable } from "./VSCodeCommonType.js";

// LogLevel from the real VS Code source - prevents numeric drift.
// VS Code values: Off=0, Trace=1, Debug=2, Info=3, Warning=4, Error=5
// (Wind previously had Trace=0…Off=6, which was inverted and incompatible.)
export { LogLevel } from "@codeeditorland/output/vs/platform/log/common/log.js";

/**
 * Logger options interface
 */
export interface ILoggerOptions {
	name?: string;
	logLevel?: import("@codeeditorland/output/vs/platform/log/common/log.js").LogLevel;
}

/**
 * Logger interface matching VS Code's ILogger shape.
 */
export interface ILogger {
	trace(message: string, ...args: any[]): void;
	debug(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
}

// Re-export common types for convenience
export type { Event, IDisposable };
