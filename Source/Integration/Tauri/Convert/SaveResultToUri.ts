// Integration/Tauri/Convert/SaveResultToUri.ts
// Purpose: Purely processes Tauri's save dialog result (Option<string>) to Option<Uri>.

import { Option, pipe } from "effect";

import {
	UriConstructor as UriFileFactory,
	type Uri,
} from "../../../Platform/VSCode/Types.js";

/**
 * @module SaveResultToUri
 * @description Processes the optional result from a Tauri save dialog (a single path string)
 * and converts it to an optional URI.
 */
export default function Convert(
	SelectedPathOption: Option.Option<string>,
): Option.Option<Uri> {
	return pipe(
		SelectedPathOption,
		Option.filter(
			(PathString): PathString is string => PathString.length > 0,
		),
		Option.map((PathString) => UriFileFactory.file(PathString)),
	);
}
