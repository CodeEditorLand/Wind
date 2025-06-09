/*
 * File: Wind/Source/Application/Instantiation/Layer.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: ../Host.js, ../Log.js, effect
 * Export: AppLayer
 */

// Source/Application/Instantiation/Layer.ts
import { Layer } from "effect";

import { LiveNativeHostService } from "../Host.js";
import { LiveLogService } from "../Log.js";

// ... we will add every other live service here

// The master application layer that composes all our native services.
// It defines the complete dependency graph of the application.
// The final layer will have requirements of `never`, meaning it's self-contained.
export const AppLayer = Layer.mergeAll(
	LiveLogService,
	LiveNativeHostService,
	// LiveConfigurationService,
	// LiveFileService,
	// etc.
);
