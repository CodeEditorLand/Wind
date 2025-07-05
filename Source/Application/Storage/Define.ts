/**
 * @module Define
 * @description
 * Defines the service for providing persistent, scoped key-value storage,
 * conforming to VS Code's `IStorageService`.
 */

import {
	AbstractStorageService,
	IStorageService,
	StorageScope,
	type IStorage,
} from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import type {
	IUserDataProfile,
	IUserDataProfilesService,
} from "@codeeditorland/output/vs/platform/userDataProfile/common/userDataProfile.js";
import type { IAnyWorkspaceIdentifier } from "@codeeditorland/output/vs/platform/workspace/common/workspace.js";
import { Effect } from "effect";

import { IntegrationService } from "../Integration/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { EffectStorage } from "./Storage.js";

/**
 * An implementation of `AbstractStorageService` that uses `EffectStorage` as its
 * backing store. This class orchestrates the creation and management of different
 * storage scopes (Application, Profile, Workspace) by creating distinct
 * `EffectStorage` instances for each.
 */
export class EffectStorageService extends AbstractStorageService {
	constructor(
		private readonly Integration: IntegrationService,
		private readonly LoggerService: LoggerService,
	) {
		// A reasonable default flush interval.
		super({ flushInterval: 60_000 });
	}

	protected override getStorage(scope: StorageScope): IStorage | undefined {
		// A full implementation would need to manage different profiles and workspaces.
		// For now, we provide a simplified mapping.
		switch (scope) {
			case StorageScope.APPLICATION:
				return new EffectStorage(
					{ Scope: scope, Name: "application" },
					this.Integration,
				);
			case StorageScope.PROFILE:
				return new EffectStorage(
					{ Scope: scope, Name: "profile" },
					this.Integration,
				);
			case StorageScope.WORKSPACE:
				return new EffectStorage(
					{ Scope: scope, Name: "workspace" },
					this.Integration,
				);
		}
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
		// A full implementation would tear down old profile storage and set up new one.
		return Promise.resolve();
	}

	protected override switchToWorkspace(
		toWorkspace: IAnyWorkspaceIdentifier,
		_preserveData: boolean,
	): Promise<void> {
		this.LoggerService.info(`Switching to workspace: ${toWorkspace.id}`);
		// A full implementation would tear down old workspace storage and set up new one.
		return Promise.resolve();
	}

	public override hasScope(
		scope: IAnyWorkspaceIdentifier | IUserDataProfile,
	): boolean {
		// A full implementation would check against the currently active profile/workspace.
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
 *
 * It is registered with the identifier "storageService" for compatibility.
 */
export class StorageService extends Effect.Service<IStorageService>()(
	"storageService",
	{
		effect: Effect.gen(function* (Generator) {
			const Integration = yield* Generator(IntegrationService);
			const Logger = yield* Generator(LoggerService);

			const ServiceInstance = new EffectStorageService(
				Integration,
				Logger,
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
