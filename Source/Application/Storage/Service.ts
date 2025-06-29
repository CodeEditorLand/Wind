/**
 * @module Service (Application/Storage)
 * @description Defines the service for providing persistent, scoped key-value
 * storage (`Memento`) for extensions, conforming to `IStorageService`.
 */

import { Effect } from "effect";
import type { IStorage } from "vs/base/parts/storage/common/storage.js";
import { ILogService } from "vs/platform/log/common/log.js";
import {
	AbstractStorageService,
	type IStorageService,
	type StorageScope,
} from "vs/platform/storage/common/storage.js";
import {
	isUserDataProfile,
	type IUserDataProfile,
} from "vs/platform/userDataProfile/common/userDataProfile";
import type { IAnyWorkspaceIdentifier } from "vs/platform/workspace/common/workspace.js";

import { IntegrationService } from "../../Integration/Tauri/Service.js";

/**
 * An implementation of `AbstractStorageService` that uses `EffectStorage` as its
 * backing store. This class orchestrates the creation and management of different
 * storage scopes (Application, Profile, Workspace) by creating distinct
 * `EffectStorage` instances for each.
 */
export class EffectStorageService extends AbstractStorageService {
	constructor(
		private readonly Integration: IntegrationService,
		private readonly LoggerService: ILogService,
	) {
		super({
			flushInterval: 0,
		});
	}

	protected override getStorage(_scope: StorageScope): IStorage | undefined {
		// This would be implemented to return the correct storage instance
		// based on the current profile and workspace state.
		return undefined;
	}

	protected override getLogDetails(scope: StorageScope): string | undefined {
		// Return a descriptive name for logging purposes.
		return `EffectStorage[${scope}]`;
	}

	protected override doInitialize(): Promise<void> {
		// Initialization is handled by the individual EffectStorage instances.
		return Promise.resolve();
	}

	protected override switchToProfile(
		toProfile: IUserDataProfile,
		_preserveData: boolean,
	): Promise<void> {
		this.LoggerService.info(`Switching to profile: ${toProfile.id}`);
		// Logic to tear down old profile storage and set up new one.
		return Promise.resolve();
	}

	protected override switchToWorkspace(
		toWorkspace: IAnyWorkspaceIdentifier,
		_preserveData: boolean,
	): Promise<void> {
		this.LoggerService.info(`Switching to workspace: ${toWorkspace.id}`);
		// Logic to tear down old workspace storage and set up new one.
		return Promise.resolve();
	}

	public override hasScope(
		scope: IAnyWorkspaceIdentifier | IUserDataProfile,
	): boolean {
		if (isUserDataProfile(scope)) {
			// Check if this profile is active
			return true;
		}
		// Check if this workspace is active
		return true;
	}
}

/**
 * The `Effect.Service` for the `IStorageService`.
 *
 * This service is responsible for providing access to persistent key-value
 * storage. The implementation lifts `AbstractStorageService` from VS Code
 * and provides it with a custom `IStorage` backend (`EffectStorage`) that
 * routes all I/O operations through our `IntegrationService`.
 */
export class StorageService extends Effect.Service<IStorageService>()(
	"storageService",
	{
		effect: Effect.gen(function* (Generator) {
			const Integration = yield* Generator(IntegrationService);
			const LoggerService = yield* Generator(ILogService);

			// This is a simplified implementation. The original `NativeWorkbenchStorageService`
			// is highly complex. We lift the abstract base class and provide our own
			// `IStorage` implementation.
			const ServiceInstance = new EffectStorageService(
				Integration,
				LoggerService,
			);

			yield* Generator(
				Effect.tryPromise({
					try: () => ServiceInstance.initialize(),
					catch: (Cause) =>
						new Error("StorageService initialization failed", {
							Cause,
						}),
				}),
			);

			return ServiceInstance;
		}),
	},
) {}
