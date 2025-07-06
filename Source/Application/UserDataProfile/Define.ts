/**
 * @module Define
 * @description
 * This module defines the services for managing user profiles. It lifts the
 * implementations from VS Code to provide profile-scoped settings, extensions,
 * and UI state.
 */

import { IEnvironmentService } from "@codeeditorland/output/vs/platform/environment/common/environment.js";
import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import {
	IUserDataProfileService,
	IUserDataProfilesService,
	UserDataProfilesService as VSCodeUserDataProfilesService,
	type DidChangeUserDataProfileEvent,
} from "@codeeditorland/output/vs/platform/userDataProfile/common/userDataProfile.js";
import { UserDataProfileService as VSCodeUserDataProfileService } from "@codeeditorland/output/vs/workbench/services/userDataProfile/browser/userDataProfileService.js";
import { Effect } from "effect";

/**
 * The `Effect.Service` for the `IUserDataProfilesService`.
 *
 * This service is responsible for managing the collection of all user profiles.
 * It lifts the original `UserDataProfilesService` class from VS Code.
 *
 * It is registered with the identifier "userDataProfilesService" for compatibility.
 */
export class UserDataProfilesService extends Effect.Service<IUserDataProfilesService>()(
	"userDataProfilesService",
	{
		effect: Effect.gen(function* (Generator) {
			const EnvironmentService = yield* Generator(IEnvironmentService);
			const FileService = yield* Generator(IFileService);
			const UriIdentityService = yield* Generator(IUriIdentityService);
			const Logger = yield* Generator(ILogService);

			// This is a simplified "in-memory" version of the UserDataProfilesService
			// that does not persist to disk, which is suitable for our initial implementation.
			class InMemoryUserDataProfilesService extends VSCodeUserDataProfilesService {
				private _storedProfiles: any[] = [];
				private _storedProfileAssociations: any = {};
				protected override getStoredProfiles() {
					return this._storedProfiles;
				}
				protected override saveStoredProfiles(p: any) {
					this._storedProfiles = p;
				}
				protected override getStoredProfileAssociations() {
					return this._storedProfileAssociations;
				}
				protected override saveStoredProfileAssociations(a: any) {
					this._storedProfileAssociations = a;
				}
			}

			const ServiceInstance = new InMemoryUserDataProfilesService(
				EnvironmentService,
				FileService,
				UriIdentityService,
				Logger,
			);

			ServiceInstance.init();

			return ServiceInstance;
		}),
	},
) {}

/**
 * The `Effect.Service` for the `IUserDataProfileService`.
 *
 * This service manages the *currently active* user profile. It lifts the
 * original `UserDataProfileService` from VS Code.
 *
 * It is registered with the identifier "userDataProfileService" for compatibility.
 */
export class UserDataProfileService extends Effect.Service<IUserDataProfileService>()(
	"userDataProfileService",
	{
		effect: Effect.gen(function* (Generator) {
			const ProfilesService = yield* Generator(IUserDataProfilesService);

			// The service is initialized with the default profile from the collection.
			const ServiceInstance = new VSCodeUserDataProfileService(
				ProfilesService.defaultProfile,
			);

			return ServiceInstance;
		}),
	},
) {}
