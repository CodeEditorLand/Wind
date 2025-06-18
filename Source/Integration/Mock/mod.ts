/*
 * File: Wind/Source/Integration/Mock/mod.ts
 * Responsibility: Aggregates mock implementations of Tauri integration services (replacing the Mountain backend) into a single Effect layer for isolated testing of the Sky frontend.
 * Modified: 2025-06-09 15:50:36 UTC
 * Dependency: ../Tauri/Definition.js, ./Clipboard/mod.js, ./Dialog/mod.js, effect
 * Export: MockIntegrationLayer
 */

/**
 * @module Mock (Integration)
 * @description Aggregates and exports the complete Mock Integration Layer.
 * This layer replaces the live Tauri integration with mock implementations for
 * isolated, fast, and reliable testing of the application services.
 */

import { Layer } from "effect";

import { IntegrationServiceTag } from "../Tauri/Definition.js"; // The interface we need to mock
import { MockClipboard } from "./Clipboard/mod.js";

// Import other mock modules here, e.g., MockDialog, MockHost
// import { MockDialog } from "./Dialog/mod.js";

/**
 * The complete Mock Integration Layer.
 *
 * It provides a mock implementation for the `IntegrationServiceTag`.
 * It is constructed by merging all the individual mock service objects.
 */
export const MockIntegrationLayer = Layer.succeed(IntegrationServiceTag, {
	...MockClipboard,
	// ...MockDialog,
	// ... other mocked services
});
