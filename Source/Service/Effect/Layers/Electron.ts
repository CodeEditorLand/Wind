1|/**
2| * @module Effect/Layers/Electron
3| * @description
4| * Complete Effect layer stack for Electron runtime (Sky).
5| * Composes the remaining Effect-typed services using Electron IPC.
6| * Configuration, Mountain, and IPC are plain services exported from their
7| * Implementation modules and no longer appear in the layer stack.
8| */
9|
11|
12|import { SandboxLive } from "../Sandbox.js";

13|import { TelemetryLive } from "../Telemetry.js";

14|
15|// ============================================================================
16|// Base Electron Layer (without config sync)
17|// ============================================================================
18|
19|/**
20| * Base Electron layer stack.
21| * Provides: Sandbox + Telemetry
22| *
23| * IPC is a plain object — import TauriIPCLive directly.
24| * Use this when you need manual control over configuration sync.
25| */
26|export const ElectronBaseLayer = Layer.empty
27|	.pipe(Layer.provideMerge(SandboxLive))

28|	.pipe(Layer.provideMerge(TelemetryLive));

29|
30|// ============================================================================
31|// Full Electron Layer (with auto config sync)
32|// ============================================================================
33|
34|/**
35| * Full Electron layer stack.
36| * Mountain-driven configuration sync runs inside the plain Mountain
37| * service while connected.
38| *
39| * This is the standard layer for Sky (Electron) builds.
40| */
41|export const ElectronLiveLayer = Layer.empty
42|	.pipe(Layer.provideMerge(SandboxLive))

43|	.pipe(Layer.provideMerge(TelemetryLive));

44|
45|// ============================================================================
46|// Electron Development Layer (with verbose logging)
47|// ============================================================================
48|
49|/**
50| * Electron layer with maximum telemetry and logging.
51| * Useful for debugging and development in Electron environment.
52| */
53|export const ElectronDevLayer = Layer.empty
54|	.pipe(Layer.provideMerge(SandboxLive))

55|	.pipe(Layer.provideMerge(TelemetryLive));

56|
57|// Export default for convenience
58|export default ElectronLiveLayer;

59|
