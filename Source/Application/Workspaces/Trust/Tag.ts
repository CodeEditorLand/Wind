/*
 * File: Wind/Source/Application/Workspaces/Trust/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 23:03:39 UTC
 * Dependency: ./Error/TrustProblem.js, effect, vs/base/common/uri.js, vs/platform/workspace/common/workspaceTrust.js
 * Export: Interface
 */

// Source/Application/Workspaces/Trust/Tag.ts
import { Context, Effect, Ref, Stream } from "effect";
import { URI } from "vs/base/common/uri.js";
import type { IWorkspaceTrustUriInfo } from "vs/platform/workspace/common/workspaceTrust.js";

import type { TrustProblem } from "./Error/TrustProblem.js";

export interface Interface {
	readonly _serviceBrand: undefined;

	// State is now an observable Ref
	readonly IsTrusted: Ref.Ref<boolean>;

	// Events are now infinite Streams
	readonly OnDidChangeTrust: Stream.Stream<boolean>;
	readonly OnDidChangeTrustedFolders: Stream.Stream<void>;

	// Promises are replaced with Effect that declare their errors
	readonly WorkspaceResolved: Effect.Effect<void, never>;
	readonly WorkspaceTrustInitialized: Effect.Effect<void, never>;

	isWorkspaceTrusted(): Effect.Effect<boolean, never>;
	setWorkspaceTrust(trusted: boolean): Effect.Effect<void, TrustProblem>;

	getUriTrustInfo(
		uri: URI,
	): Effect.Effect<IWorkspaceTrustUriInfo, TrustProblem>;
	setUrisTrust(
		uris: URI[],
		trusted: boolean,
	): Effect.Effect<void, TrustProblem>;

	// ... other methods refactored to return Effect
}

const WorkspaceTrustManagementServiceTag = Context.Tag<Interface>(
	"vscode/WorkspaceTrustManagementService",
);

export default WorkspaceTrustManagementServiceTag;
