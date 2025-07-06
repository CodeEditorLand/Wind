/**
 * @module Define
 * @description
 * Defines the service for handling URI identity and comparison, which is
 * crucial for correctly comparing resource paths across different filesystems
 * (case-sensitive vs. case-insensitive).
 */

import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService as VSCodeUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentityService.js";
import { Effect } from "effect";

/**
 * The `Effect.Service` for the `IUriIdentityService`.
 *
 * This service implementation "lifts" the original `UriIdentityService` class
 * from VS Code. It provides essential utilities for canonicalizing and comparing
 * URIs in a way that respects the case-sensitivity of the underlying filesystem
 * provider.
 *
 * It is registered with the identifier "uriIdentityService" for compatibility.
 */
export class URIIdentityService extends Effect.Service<IUriIdentityService>()(
	"uriIdentityService",
	{
		effect: Effect.gen(function* (Generator) {
			const FileService = yield* Generator(IFileService);

			const ServiceInstance = new VSCodeUriIdentityService(FileService);

			return ServiceInstance;
		}),
	},
) {}
