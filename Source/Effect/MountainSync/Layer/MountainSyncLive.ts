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

import makeMountainSync from "../Implementation/MountainSyncImplementation.js";
import type { MountainSyncService } from "../Interface/MountainSyncService.js";

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

const MountainSyncLive: MountainSyncService = {
	start: async (Config) => {
		const svc = Resolve();
		if (svc) await svc.start(Config);
	},

	stop: async () => {
		const svc = Resolve();
		if (svc) await svc.stop();
	},

	syncNow: async () => {
		const svc = Resolve();
		if (svc) return svc.syncNow();
		return {
			success: false,
			itemsSynced: 0,
			duration: 0,
		};
	},

	getStatus: async () => {
		const svc = Resolve();
		if (svc) return svc.getStatus();
		return "idle" as const;
	},

	getStats: async () => {
		const svc = Resolve();
		if (svc) return svc.getStats();
		return {
			lastSyncTime: 0,
			syncCount: 0,
			successCount: 0,
			errorCount: 0,
			itemsSynced: 0,
		};
	},

	pause: async () => {
		const svc = Resolve();
		if (svc) await svc.pause();
	},

	resume: async () => {
		const svc = Resolve();
		if (svc) await svc.resume();
	},
} satisfies MountainSyncService;

export default MountainSyncLive;
