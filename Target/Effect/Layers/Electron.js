import { Layer } from "effect";
import {
  ConfigurationLive,
  ConfigurationWithSyncLive
} from "../Configuration.js";
import { IPCElectronLive } from "../IPC.js";
import { MountainLive } from "../Mountain.js";
import { SandboxLive } from "../Sandbox.js";
import { TelemetryLive } from "../Telemetry.js";
const ElectronBaseLayer = Layer.empty.pipe(Layer.provideMerge(SandboxLive)).pipe(Layer.provideMerge(IPCElectronLive)).pipe(Layer.provideMerge(TelemetryLive)).pipe(Layer.provideMerge(ConfigurationLive)).pipe(Layer.provideMerge(MountainLive));
const ElectronLiveLayer = Layer.empty.pipe(Layer.provideMerge(SandboxLive)).pipe(Layer.provideMerge(IPCElectronLive)).pipe(Layer.provideMerge(TelemetryLive)).pipe(Layer.provideMerge(ConfigurationWithSyncLive)).pipe(Layer.provideMerge(MountainLive));
const ElectronDevLayer = Layer.empty.pipe(Layer.provideMerge(SandboxLive)).pipe(Layer.provideMerge(IPCElectronLive)).pipe(Layer.provideMerge(TelemetryLive)).pipe(Layer.provideMerge(ConfigurationWithSyncLive)).pipe(Layer.provideMerge(MountainLive));
var Electron_default = ElectronLiveLayer;
export {
  ElectronBaseLayer,
  ElectronDevLayer,
  ElectronLiveLayer,
  Electron_default as default
};
//# sourceMappingURL=Electron.js.map
