// Integration/Tauri/Convert/OpenResultToSingleUri.ts
// Purpose: Purely processes Tauri's open dialog result (Option<string | string[]>) to Option<Uri>.

import { Option, pipe } from "effect";

import {
	UriConstructor as UriFileFactory,
	type Uri,
} from "../../../Platform/VSCode/Type.js";

// For Uri.file() and Uri type

/**
 * @module OpenResultToSingleUri
 * @description Processes the optional result from a Tauri open dialog,
 * expecting a single file path, and converts it to an optional URI.
 */
export default function Convert(
	SelectedPathOption: Option.Option<string | string[]>,
): Option.Option<Uri> {
	return pipe(
		SelectedPathOption,

		Option.filter(
			(SelectedValue): SelectedValue is string =>
				typeof SelectedValue === "string" && SelectedValue.length > 0,
		),

		Option.map((PathString) => UriFileFactory.file(PathString)),
	);
}
