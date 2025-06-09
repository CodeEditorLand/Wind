/*
 * File: Wind/Source/Application/Environment/Definition.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 23:03:39 UTC
 * Dependency: effect, vs/workbench/services/environment/electron-sandbox/environmentService.js
 */

import { Cache, Effect, Layer } from "effect";
import type { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService.js";

import {
	FetchAppRoot,
	FetchBackupPath,
	FetchExecPath,
	FetchHomeDir,
	FetchLogsHome,
	FetchMachineId,
	FetchTmpDir,
	FetchUserDataPath,
	// ... other fetch effects will be added here
} from "../../Integration/Tauri.js";

// This class implements the INativeWorkbenchEnvironmentService interface.
// Instead of taking a giant config object, it fetches each piece of data
// on demand from the backend via Effect, caching the results.
class TauriWorkbenchEnvironmentService
	implements INativeWorkbenchEnvironmentService
{
	readonly _serviceBrand: undefined;

	// Use Effect's built-in Cache to avoid re-invoking Tauri for static values.
	private readonly appRootCache = Cache.make({
		capacity: 1,
		timeToLive: "1 hours",
		lookup: () => FetchAppRoot(),
	});

	private readonly userDataPathCache = Cache.make({
		capacity: 1,
		timeToLive: "1 hours",
		lookup: () => FetchUserDataPath(),
	});

	private readonly machineIdCache = Cache.make({
		capacity: 1,
		timeToLive: "Infinity",
		lookup: () => FetchMachineId(),
	});

	// --- Properties from INativeWorkbenchEnvironmentService ---
	// Each property is implemented as a getter that runs an Effect.
	// The original interface expects synchronous properties, so we must `Effect.runSync`
	// here. A better, long-term solution would be to refactor consumers
	// to handle asynchronous environment properties.

	get appRoot(): string {
		return Effect.runSync(this.appRootCache.get);
	}
	get userDataPath(): string {
		return Effect.runSync(this.userDataPathCache.get);
	}
	get machineId(): string {
		return Effect.runSync(this.machineIdCache.get);
	}

	// Example of a non-cached, directly fetched property
	get execPath(): string {
		return Effect.runSync(FetchExecPath());
	}

	// --- Placeholder Implementations for other properties ---
	// These will be filled out with their own cached effects.
	get userHome() {
		return Effect.runSync(FetchHomeDir());
	}
	get tmpDir() {
		return Effect.runSync(FetchTmpDir());
	}
	get backupPath() {
		return Effect.runSync(FetchBackupPath());
	}
	get logsHome() {
		return Effect.runSync(FetchLogsHome());
	}
	// ... many more properties to implement here using the same pattern.
	// For brevity, the rest are stubbed as `die`.
	get window() {
		return Effect.runSync(
			Effect.die("Property 'window' not implemented."),
		) as any;
	}
	get mainPid() {
		return Effect.runSync(
			Effect.die("Property 'mainPid' not implemented."),
		) as any;
	}
	// ... and so on for all other interface properties.
}

// The service definition is an Effect that creates an instance of our class.
const Definition = Effect.sync(() => new TauriWorkbenchEnvironmentService());

export default Definition;
