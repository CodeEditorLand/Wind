import { Option, pipe } from "effect";

import type { FileFilter, TauriDialogFilter } from "../CoreTypes.js";

export function vscodeFiltersToTauriFiltersOption(
	vscodeFilters?: readonly FileFilter[],
): Option.Option<TauriDialogFilter[]> {
	return pipe(
		Option.fromNullable(vscodeFilters),
		Option.filter((filters) => filters.length > 0),
		Option.map((filters) =>
			filters.map((f: FileFilter) => ({
				name: f.name,
				extensions: [...f.extensions], // Ensure to copy extensions array
			})),
		),
	);
}
