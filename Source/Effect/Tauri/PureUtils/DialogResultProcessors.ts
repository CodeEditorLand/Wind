import { Option, pipe } from "effect";

import { URI } from "../CoreTypes.js"; // Uses URI type alias

export function processTauriOpenResultToSingleUriOption(
	selectedOption: Option.Option<string | string[]>,
): Option.Option<URI> {
	return pipe(
		selectedOption,
		Option.filter(
			(s): s is string => typeof s === "string" && s.length > 0,
		),
		Option.map(URI.file),
	);
}

export function processTauriOpenResultToUriArrayOption(
	selectedOption: Option.Option<string | string[]>,
): Option.Option<URI[]> {
	return pipe(
		selectedOption,
		Option.map((s) => (Array.isArray(s) ? s : [s])),
		Option.filter(
			(paths) =>
				paths.length > 0 &&
				paths.every((p) => typeof p === "string" && p.length > 0),
		),
		Option.map((paths) => paths.map(URI.file)),
	);
}

export function processTauriSaveResultToUriOption(
	selectedPathOption: Option.Option<string>,
): Option.Option<URI> {
	return pipe(
		selectedPathOption,
		Option.filter((s): s is string => s.length > 0),
		Option.map(URI.file),
	);
}
