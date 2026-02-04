import { Layer } from "effect";
import {
  ConfigurationLive,
  ConfigurationWithSyncLive
} from "../Configuration.js";
import { IPCTauriLive } from "../IPC.js";
import { MountainLive } from "../Mountain.js";
import { SandboxLive } from "../Sandbox.js";
import { TelemetryLive } from "../Telemetry.js";
import { EnvironmentLive } from "../Environment.js";
import { HealthLive } from "../Health.js";
import { BootstrapLive } from "../Bootstrap.js";
import { LiveClipboardServiceLayer as ClipboardLive } from "../Clipboard.js";
import { MountainSyncLive } from "../MountainSync.js";
const TauriBaseLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive)
);
const TauriLiveLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationWithSyncLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive)
);
const TauriDevLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationWithSyncLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive)
);
var Tauri_default = TauriLiveLayer;
export {
  TauriBaseLayer,
  TauriDevLayer,
  TauriLiveLayer,
  Tauri_default as default
};
//# sourceMappingURL=Tauri.js.map
