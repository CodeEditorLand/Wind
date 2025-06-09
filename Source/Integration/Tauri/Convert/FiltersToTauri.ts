/*
 * File: Wind/Source/Integration/Tauri/Convert/FiltersToTauri.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:01 UTC
 * Dependency: ../../../Platform/VSCode/Type.js, ../Type.js, effect
 * Export: Convert
 */

// Integration/Tauri/Convert/FiltersToTauri.ts
// Purpose: Purely converts VSCode FileFilter array to TauriDialogFilter array.

import { Option, pipe } from "effect";

import type { FileFilter as VsCodeFilter } from "../../../Platform/VSCode/Type.js";
// Tauri specific types
import type { DialogFilter as TauriFilter } from "../Type.js";

/**
 * @module FiltersToTauri
 * @description Converts an array of VSCode FileFilters to an optional array of Tauri DialogFilters.
 * Returns Option.none() if the input array is null, undefined, or empty.
 */
export default function Convert(
	MaybeFilters?: readonly VsCodeFilter[],
): Option.Option<TauriFilter[]> {
	return pipe(
		Option.fromNullable(MaybeFilters),

		Option.filter((FiltersArray) => FiltersArray.length > 0),

		Option.map((FiltersArray) =>
			FiltersArray.map((AFilter: VsCodeFilter) => ({
				name: AFilter.name,

				extensions: [...AFilter.extensions],
			})),
		),
	);
}
