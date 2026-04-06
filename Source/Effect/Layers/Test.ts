/**
 * @module Effect/Layers/Test
 * @description
 * Test layer stack with all mocks.
 * Useful for unit testing without real backend dependencies.
 */

import { Layer } from "effect";

import { ConfigurationMock } from "../Configuration.js";
import { IPCMockLive } from "../IPC.js";
import { MountainMockLive } from "../Mountain.js";
import { SandboxMockLive } from "../Sandbox.js";
import { TelemetryLive, TelemetryMockLive } from "../Telemetry.js";

// ============================================================================
// Full Test Layer (all mocks)
// ============================================================================

/**
 * Complete test layer with all services mocked.
 * No real backend connections, all effects succeed with dummy data.
 */
export const TestLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxMockLive))
	.pipe(Layer.provideMerge(IPCMockLive))
	.pipe(Layer.provideMerge(ConfigurationMock))
	.pipe(Layer.provideMerge(TelemetryMockLive))
	.pipe(Layer.provideMerge(MountainMockLive));

// ============================================================================
// Test Layer with Real Telemetry
// ============================================================================

/**
 * Test layer with real telemetry but mocked services.
 * Useful for testing performance monitoring.
 */
export const TestWithTelemetryLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxMockLive))
	.pipe(Layer.provideMerge(IPCMockLive))
	.pipe(Layer.provideMerge(ConfigurationMock))
	.pipe(Layer.provideMerge(TelemetryLive))
	.pipe(Layer.provideMerge(MountainMockLive));

// Export default for convenience
export default TestLayer;
