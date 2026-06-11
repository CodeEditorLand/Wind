/**
 * @module Effect/MountainSync/Layer/MountainSyncLive
 * @description
 * Live layer for MountainSync service.
 * Provides the production implementation that depends on Mountain, IPC, and Telemetry.
 * The underlying service is constructed lazily on first method call - the
 * `__CEL_SERVICES__` global is populated by the workbench AFTER module load,
 * so resolving it at module evaluation time would permanently capture `null`
 * handles. Until the global is populated every method is a safe no-op.
 * @see {\@link Effect/MountainSync/Implementation/MountainSyncImplementation} Implementation
 * @see {\@link Effect/MountainSync/Layer/MountainSyncMock} Mock layer
 * @category Layer
 */

import { Effect, Layer } from "effect";

import makeMountainSync from "../Implementation/MountainSyncImplementation.js";
import type { MountainSyncService } from "../Interface/MountainSyncService.js";
import MountainSyncTag from "../Tag/MountainSyncTag.js";

let Resolved: MountainSyncService | null = null;

const Resolve = (): MountainSyncService | null => {
	if (Resolved) {
		return Resolved;
	}

	const Services = (globalThis as any).__CEL_SERVICES__;

	const Mountain = Services?.Mountain ?? null;

	const IPC = Services?.IPC ?? null;

	const Telemetry = Services?.Telemetry ?? null;

	if (!Mountain || !IPC || !Telemetry) {
		return null;
	}

	Resolved = makeMountainSync(Mountain, IPC, Telemetry);

	return Resolved;
};

const MountainSyncLive = Layer.succeed(MountainSyncTag, {
	start: (Config) =>
		Effect.suspend(() => Resolve()?.start(Config) ?? Effect.void),

	stop: () => Effect.suspend(() => Resolve()?.stop() ?? Effect.void),

	syncNow: () =>
		Effect.suspend(
			() =>
				Resolve()?.syncNow() ??
				Effect.succeed({
					success: false,
					itemsSynced: 0,
					duration: 0,
				}),
		),

	getStatus: () =>
		Effect.suspend(
			() => Resolve()?.getStatus() ?? Effect.succeed("idle" as const),
		),

	getStats: () =>
		Effect.suspend(
			() =>
				Resolve()?.getStats() ??
				Effect.succeed({
					lastSyncTime: 0,
					syncCount: 0,
					successCount: 0,
					errorCount: 0,
					itemsSynced: 0,
				}),
		),

	pause: () => Effect.suspend(() => Resolve()?.pause() ?? Effect.void),

	resume: () => Effect.suspend(() => Resolve()?.resume() ?? Effect.void),
} satisfies MountainSyncService);

export default MountainSyncLive;
