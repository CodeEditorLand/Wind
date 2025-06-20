

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
