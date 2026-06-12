/**
 * @module Effect/Layers/Test
 * @description
 * Test layer stack with all mocks.
 * Useful for unit testing without real backend dependencies.
 * Configuration, Mountain, and IPC are plain objects exported from their
 * Implementation modules and no longer appear in the layer stack.
 */

import { Layer } from "effect";

import { SandboxMockLive } from "../Sandbox.js";
import { TelemetryLive, TelemetryMockLive } from "../Telemetry.js";

// ============================================================================
// Full Test Layer (all mocks)
// ============================================================================

/**
 * Complete test layer with all services mocked.
 * No real backend connections, all effects succeed with dummy data.
 * IPC mock is a plain object — import IPCMockLive directly.
 */
export const TestLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxMockLive))
	.pipe(Layer.provideMerge(TelemetryMockLive));

// ============================================================================
// Test Layer with Real Telemetry
// ============================================================================

/**
 * Test layer with real telemetry but mocked services.
 * Useful for testing performance monitoring.
 * IPC mock is a plain object — import IPCMockLive directly.
 */
export const TestWithTelemetryLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxMockLive))
	.pipe(Layer.provideMerge(TelemetryLive));

// Export default for convenience
export default TestLayer;
