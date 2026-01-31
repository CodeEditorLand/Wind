import * as Effect from "effect/Effect";

import { createConfigurationServiceLayer as _createConfigurationServiceLayer } from "./Services/ConfigurationService.js";
import { createDialogServiceLayer as _createDialogServiceLayer } from "./Services/DialogService.js";
import { createEnvironmentServiceLayer as _createEnvironmentServiceLayer } from "./Services/EnvironmentService.js";
import { createFileServiceLayer as _createFileServiceLayer } from "./Services/FileService.js";
/**
 * @module Bootstrap/Integration
 * @description
 * Main integration entry point for Wind bootstrap VSCode service integration.
 *
 * Exports:
 * - Services: Effect-TS based service layers (Environment, Logger, Configuration, File, Dialog)
 * - ServiceAdapter: Advanced bridge between Wind Effect-TS services and VSCode ServiceCollection
 * - Types/VSCodeTypes: VSCode type definitions for compatibility
 */

// =============================================================================
// INTERNAL IMPORTS (for combined layer)
// =============================================================================
import { createLoggerServiceLayer as _createLoggerServiceLayer } from "./Services/LoggerService.js";

// ============================================================================
// LOGGER SERVICE
// ============================================================================

export {
	LoggerServiceTag,
	createLoggerServiceLayer,
} from "./Services/LoggerService.js";

export type { LoggerService } from "./Services/LoggerService.js";

export {
	// Effect-TS wrappers for logging
	errorEffect,
	infoEffect,
	warningEffect,
	debugEffect,
	traceEffect,
	criticalEffect,
} from "./Services/LoggerService.js";

// ============================================================================
// ENVIRONMENT SERVICE
// ============================================================================

export {
	EnvironmentServiceTag,
	createEnvironmentServiceLayer,
} from "./Services/EnvironmentService.js";

export type { EnvironmentService } from "./Services/EnvironmentService.js";

export {
	// Platform constants
	Platform,
} from "./Services/EnvironmentService.js";

// ============================================================================
// CONFIGURATION SERVICE
// ============================================================================

export {
	ConfigurationServiceTag,
	createConfigurationServiceLayer,
} from "./Services/ConfigurationService.js";

export type { ConfigurationService } from "./Services/ConfigurationService.js";

export {
	// Effect-TS wrappers for configuration
	getValueEffect,
	updateValueEffect,
	resetEffect,
	getConfigurationEffect,
	setManyEffect,
} from "./Services/ConfigurationService.js";

// ============================================================================
// FILE SERVICE
// ============================================================================

export {
	FileServiceTag,
	createFileServiceLayer,
} from "./Services/FileService.js";

export type {
	FileService,
	FileStat,
	DirEntry,
	FileType,
} from "./Services/FileService.js";

export {
	// Effect-TS wrappers for file operations
	readFileEffect,
	writeFileEffect,
	existsEffect,
	statEffect,
	mkdirEffect,
	deleteEffect,
	readdirEffect,
	copyEffect,
	moveEffect,
	watchEffect,
} from "./Services/FileService.js";

// ============================================================================
// DIALOG SERVICE
// ============================================================================

export {
	DialogServiceTag,
	createDialogServiceLayer,
} from "./Services/DialogService.js";

export type {
	DialogService,
	FileDialogOptions,
	FileFilter,
	MessageBoxOptions,
	MessageBoxResult,
	MessageButtons,
} from "./Services/DialogService.js";

export {
	// Effect-TS wrappers for dialogs
	showOpenDialogEffect,
	showSaveDialogEffect,
	showMessageBoxEffect,
	showInformationMessageEffect,
	showWarningMessageEffect,
	showErrorMessageEffect,
	showConfirmDialogEffect,
	showDirectoryPickerEffect,

	// Pre-configured dialog helpers
	confirmCloseUnsaved,
	confirmOverwrite,
} from "./Services/DialogService.js";

// ============================================================================
// COMBINED LAYER
// ============================================================================

/**
 * Combined layer providing all core services
 * Usage: Effect.provide(provideCoreServicesLayer(), program)
 */
export const provideCoreServicesLayer = () => {
	return Effect.Merge.all([
		_createLoggerServiceLayer(),
		_createEnvironmentServiceLayer(),
		_createConfigurationServiceLayer(),
		_createFileServiceLayer(),
		_createDialogServiceLayer(),
	]);
};
