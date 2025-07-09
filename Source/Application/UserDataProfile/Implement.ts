/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the user profile services.
 */

import { IEnvironmentService } from "@codeeditorland/output/vs/platform/environment/common/environment.js";
import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { Layer } from "effect";

import { BrowserWorkbenchEnvironmentService } from "../BrowserWorkbenchEnvironment/Define.js";
import { FileService } from "../File/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { URIIdentityService } from "../URIIdentity2/Define.js";
import { UserDataProfileService, UserDataProfilesService } from "./Define.js";

/**
 * The live implementation `Layer` for the `UserDataProfilesService`.
 * This layer provides the service that manages the collection of all profiles.
 */
export const ProvideUserDataProfiles =
	UserDataProfilesService.Default as Layer.Layer<
		UserDataProfilesService,
		never,
		IEnvironmentService | IFileService | IUriIdentityService | ILogService
	>;

/**
 * The live implementation `Layer` for the `UserDataProfileService`.
 * This layer provides the service that manages the currently active profile.
 * It depends on the `UserDataProfilesService` to get the initial default profile.
 */
export const ProvideUserDataProfile =
	UserDataProfileService.Default as Layer.Layer<
		UserDataProfileService,
		never,
		IUserDataProfilesService
	>;

/**
 * A combined layer that provides both user profile services, ensuring the
 * correct dependency order.
 */
export const ProvideProfiles = ProvideUserDataProfile.pipe(
	Layer.provide(ProvideUserDataProfiles),
);
