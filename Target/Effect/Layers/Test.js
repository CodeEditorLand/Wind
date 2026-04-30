import { Layer } from "effect";
import { ConfigurationMock } from "../Configuration.js";
import { IPCMockLive } from "../IPC.js";
import { MountainMockLive } from "../Mountain.js";
import { SandboxMockLive } from "../Sandbox.js";
import { TelemetryLive, TelemetryMockLive } from "../Telemetry.js";
const TestLayer = Layer.empty.pipe(Layer.provideMerge(SandboxMockLive)).pipe(Layer.provideMerge(IPCMockLive)).pipe(Layer.provideMerge(ConfigurationMock)).pipe(Layer.provideMerge(TelemetryMockLive)).pipe(Layer.provideMerge(MountainMockLive));
const TestWithTelemetryLayer = Layer.empty.pipe(Layer.provideMerge(SandboxMockLive)).pipe(Layer.provideMerge(IPCMockLive)).pipe(Layer.provideMerge(ConfigurationMock)).pipe(Layer.provideMerge(TelemetryLive)).pipe(Layer.provideMerge(MountainMockLive));
var Test_default = TestLayer;
export {
  TestLayer,
  TestWithTelemetryLayer,
  Test_default as default
};
//# sourceMappingURL=Test.js.map
