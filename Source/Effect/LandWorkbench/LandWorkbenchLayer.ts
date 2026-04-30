/**
 * @module Effect/LandWorkbench/LandWorkbenchLayer
 * @description
 * Composed `Layer` that provides every workbench-tier Wind service
 * at once. Sky's bundled-electron entry calls
 * `Effect.provide(LandWorkbenchLayer)` after `__CEL_SERVICES__` is
 * populated; any Wind program scoped under the layer can yield
 * each `Tag` independently.
 *
 * The composition is `Layer.mergeAll` - none of the Live layers
 * depend on each other; each only consults its own slot of
 * `globalThis.__CEL_SERVICES__`. A failure in one layer
 * (`<X>BridgeUnavailable`) does not poison the others.
 * @category Composition
 */

import { Layer } from "effect";

import { WorkbenchClipboardLive } from "../WorkbenchClipboard/Implementation/WorkbenchClipboardLive.js";
import { WorkbenchCommandLive } from "../WorkbenchCommand/Implementation/WorkbenchCommandLive.js";
import { WorkbenchDialogLive } from "../WorkbenchDialog/Implementation/WorkbenchDialogLive.js";
import { WorkbenchHostLive } from "../WorkbenchHost/Implementation/WorkbenchHostLive.js";
import { WorkbenchKeybindingLive } from "../WorkbenchKeybinding/Implementation/WorkbenchKeybindingLive.js";
import { WorkbenchLifecycleLive } from "../WorkbenchLifecycle/Implementation/WorkbenchLifecycleLive.js";
import { WorkbenchNotificationLive } from "../WorkbenchNotification/Implementation/WorkbenchNotificationLive.js";
import { WorkbenchStorageLive } from "../WorkbenchStorage/Implementation/WorkbenchStorageLive.js";
import { WorkbenchThemeLive } from "../WorkbenchTheme/Implementation/WorkbenchThemeLive.js";
import { WorkbenchWorkspaceLive } from "../WorkbenchWorkspace/Implementation/WorkbenchWorkspaceLive.js";
import { UserSettingsLive } from "../UserSettings/Implementation/UserSettingsLive.js";

export const LandWorkbenchLayer = Layer.mergeAll(
	UserSettingsLive,
	WorkbenchStorageLive,
	WorkbenchLifecycleLive,
	WorkbenchThemeLive,
	WorkbenchCommandLive,
	WorkbenchNotificationLive,
	WorkbenchDialogLive,
	WorkbenchClipboardLive,
	WorkbenchKeybindingLive,
	WorkbenchHostLive,
	WorkbenchWorkspaceLive,
);

export default LandWorkbenchLayer;
