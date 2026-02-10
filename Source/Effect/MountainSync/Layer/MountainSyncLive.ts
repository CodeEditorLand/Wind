/**
 * @module Effect/MountainSync/Layer/MountainSyncLive
 * @description
 * Live layer for MountainSync service.
 * Provides the production implementation that depends on Mountain, IPC, and Telemetry.
 * @see {@link Effect/MountainSync/Implementation/MountainSyncImplementation} Implementation
 * @see {@link Effect/MountainSync/Layer/MountainSyncMock} Mock layer
 * @category Layer
 */

import { Effect, Layer } from "effect";
import MountainSyncTag from "../Tag/MountainSyncTag.js";
import makeMountainSync from "../Implementation/MountainSyncImplementation.js";
import { MountainTag } from "../../Mountain.js";
import { IPCTag } from "../../IPC.js";
import { TelemetryTag } from "../../Telemetry.js";

/**
 * Live layer for MountainSync service.
 * Provides the production implementation and requires Mountain, IPC, and Telemetry services.
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
const MountainSyncLive = Layer.effect(
	MountainSyncTag,
	Effect.gen(function* () {
		const mountain = yield* MountainTag;
		const ipc = yield* IPCTag;
		const telemetry = yield* TelemetryTag;

		return makeMountainSync(mountain, ipc, telemetry);
	}),
);

export default MountainSyncLive;
