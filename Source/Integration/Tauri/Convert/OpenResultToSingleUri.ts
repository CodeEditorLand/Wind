// Integration/Tauri/Convert/OpenResultToSingleUri.ts
// Purpose: Purely processes Tauri's open dialog result (Option<string | string[]>) to Option<URI>.

import { Option, pipe } from "effect";

import { Uri } from "../../../Platform/VSCode/Types.js"; // VSCode URI

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
		Option.map((PathString) => Uri.file(PathString)), // Use Uri.file static method
	);
}
