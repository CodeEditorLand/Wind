/*
 * File: Wind/Source/Integration/Tauri/Convert/UriToPathString.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:00 UTC
 * Dependency: effect
 * Export: Convert
 */

// Integration/Tauri/Convert/UriToPathString.ts
// Purpose: Purely converts a VSCode URI to an optional Tauri-compatible file system path string.

import { Option, pipe } from "effect";

// Use types from the Platform/VSCode type aggregator
import {
	Scheme,
	// UriConstructor is not used here, remove if not needed elsewhere
	type Uri,
} from "../../../Platform/VSCode/Type.js";

/**
 * @module UriToPathString
 * @description Converts a VSCode URI to an optional Tauri-compatible file system path string.
 * Returns Option.none() if the URI is not a 'file' scheme or is null/undefined.
 */
export default function Convert(MaybeUri?: Uri): Option.Option<string> {
	return pipe(
		Option.fromNullable(MaybeUri),

		Option.filter((CheckedUri) => CheckedUri.scheme === Scheme.file),

		Option.map((FileUri) => FileUri.fsPath),
	);
}
