/*
 * File: Wind/Source/Application/Workspaces/Trust/Error/TrustProblem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: effect
 * Export: FileSystemProblem, RemoteResolverProblem, StorageProblem, TrustProblem
 */

// Source/Application/Workspaces/Trust/Error/TrustProblem.ts
import { Data } from "effect";

import type {
	TauriFileSystemProblem,
	TauriRemoteResolverProblem,
	TauriStorageProblem,
} from "../../../Integration/Tauri.js"; // Assuming these exist

// A union of all possible errors this service can encounter.
export type TrustProblem =
	| StorageProblem
	| FileSystemProblem
	| RemoteResolverProblem;

// Specific error types for this domain.
export class StorageProblem extends Data.TaggedError("StorageProblem")<{
	readonly cause: TauriStorageProblem;
	readonly context: "LoadTrustInfo" | "SaveTrustInfo";
}> {}

export class FileSystemProblem extends Data.TaggedError("FileSystemProblem")<{
	readonly cause: TauriFileSystemProblem;
	readonly context: "CanonicalizeUri";
}> {}

export class RemoteResolverProblem extends Data.TaggedError(
	"RemoteResolverProblem",
)<{
	readonly cause: TauriRemoteResolverProblem;
	readonly context: "ResolveAuthority" | "GetCanonicalUri";
}> {}
