/*
 * File: Wind/Source/Integration/Tauri/Convert/OpenResultToUriArray.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:00 UTC
 * Dependency: effect
 * Export: Convert
 */

// Integration/Tauri/Convert/OpenResultToUriArray.ts
// Purpose: Purely processes Tauri's open dialog result (Option<string | string[]>) to Option<Uri[]>.

import { Option, pipe } from "effect";

import {
	UriConstructor as UriFileFactory,
	type Uri,
} from "../../../Platform/VSCode/Type.js";

/**
 * @module OpenResultToUriArray
 * @description Processes the optional result from a Tauri open dialog,


 * handling single or multiple selected paths, and converts them to an optional array of URIs.
 */
export default function Convert(
	SelectedPathsOption: Option.Option<string | string[]>,
): Option.Option<Uri[]> {
	return pipe(
		SelectedPathsOption,

		Option.map((SelectedValue) =>
			Array.isArray(SelectedValue) ? SelectedValue : [SelectedValue],
		),

		Option.filter(
			(PathsArray) =>
				PathsArray.length > 0 &&
				PathsArray.every(
					(PathString) =>
						typeof PathString === "string" && PathString.length > 0,
				),
		),

		Option.map((ValidPathsArray) =>
			ValidPathsArray.map((PathString) =>
				UriFileFactory.file(PathString),
			),
		),
	);
}
