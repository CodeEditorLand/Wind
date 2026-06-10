/**
 * @module Effect/MountainSync/Layer/MountainSyncLive
 * @description
 * Live layer for MountainSync service.
 * Provides the production implementation that depends on Mountain, IPC, and Telemetry.
 * @see {\@link Effect/MountainSync/Implementation/MountainSyncImplementation} Implementation
 * @see {\@link Effect/MountainSync/Layer/MountainSyncMock} Mock layer
 * @category Layer
 */

import { Layer } from "effect";

import makeMountainSync from "../Implementation/MountainSyncImplementation.js";
import MountainSyncTag from "../Tag/MountainSyncTag.js";

/**
 * Live layer for MountainSync service.
 * Provides the production implementation using globally-available CEL services.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { MountainSyncLive } from "./Effect/MountainSync/Layer/MountainSyncLive.js";
 * import { MountainLive } from "./Effect/Mountain/index.js";
 * import { IPCMockLive } from "./Effect/IPC/Mock.js";
 * import { TelemetryLive } from "./Effect/Telemetry/index.js";
 *
 * const appLayer = Layer.mergeAll(
 *   MountainLive,
 *   IPCMockLive,
 *   TelemetryLive,
 *   MountainSyncLive
 * );
 * ```
 */
function makeMountainSyncService() {
	const Globals = globalThis as any;

	const mountain = Globals.__CEL_SERVICES__?.Mountain ?? null;

	const ipc = Globals.__CEL_SERVICES__?.IPC ?? null;

	const telemetry = Globals.__CEL_SERVICES__?.Telemetry ?? null;

	return makeMountainSync(mountain, ipc, telemetry);
}

const MountainSyncLive = Layer.succeed(
	MountainSyncTag,

	makeMountainSyncService(),
);

export default MountainSyncLive;
