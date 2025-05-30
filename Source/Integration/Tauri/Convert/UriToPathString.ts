// Integration/Tauri/Convert/UriToPathString.ts
// Purpose: Purely converts a VSCode URI to an optional Tauri-compatible file system path string.

import { Option, pipe } from "effect";

// Assuming types are imported from a central VSCode type aggregator for the project
import { Scheme, Uri } from "../../../Platform/VSCode/Types.js"; // Adjust path as needed

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
