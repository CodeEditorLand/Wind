1|/**
2| * @module Effect/Layers/Test
3| * @description
4| * Test layer stack with all mocks.
5| * Useful for unit testing without real backend dependencies.
6| * Configuration, Mountain, and IPC are plain objects exported from their
7| * Implementation modules and no longer appear in the layer stack.
8| */
9|
11|
12|import { SandboxMockLive } from "../Sandbox.js";

13|import { TelemetryLive, TelemetryMockLive } from "../Telemetry.js";

14|
15|// ============================================================================
16|// Full Test Layer (all mocks)
17|// ============================================================================
18|
19|/**
20| * Complete test layer with all services mocked.
21| * No real backend connections, all effects succeed with dummy data.
22| * IPC mock is a plain object — import IPCMockLive directly.
23| */
24|export const TestLayer = Layer.empty
25|	.pipe(Layer.provideMerge(SandboxMockLive))

26|	.pipe(Layer.provideMerge(TelemetryMockLive));

27|
28|// ============================================================================
29|// Test Layer with Real Telemetry
30|// ============================================================================
31|
32|/**
33| * Test layer with real telemetry but mocked services.
34| * Useful for testing performance monitoring.
35| * IPC mock is a plain object — import IPCMockLive directly.
36| */
37|export const TestWithTelemetryLayer = Layer.empty
38|	.pipe(Layer.provideMerge(SandboxMockLive))

39|	.pipe(Layer.provideMerge(TelemetryLive));

40|
41|// Export default for convenience
42|export default TestLayer;

43|
