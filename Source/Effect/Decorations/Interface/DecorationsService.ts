import type { DecorationsProblem } from "../Type/DecorationsProblem.js";

/**
 * A file decoration: badge letter, tooltip, and optional color hint.
 * Microsoft VSCode Reference: IDecoration from vs/workbench/services/decorations/common/decorations.ts
 */
export interface FileDecoration {
	readonly badge?: string;

	readonly tooltip?: string;

	readonly color?: string;

	readonly propagate?: boolean;
}

/**
 * Decorations service interface.
 * Manages file/folder decorations in the explorer tree (git dirty badges,
 * error squiggles, custom extension badges).
 *
 * Microsoft VSCode Reference: IDecorationsService from
 * vs/workbench/services/decorations/common/decorations.ts
 */
export interface DecorationsService {
	/** Get the decoration for a specific URI. Returns null when none applies. */
	readonly GetDecoration: (
		uri: string,

		includeChildren: boolean,
	) => Promise<FileDecoration | null>;

	/** Get decorations for multiple URIs in a single round-trip. */
	readonly GetDecorations: (
		uris: readonly string[],
	) => Promise<ReadonlyMap<string, FileDecoration>>;

	/** Register a decoration for a URI (overrides any existing decoration). */
	readonly SetDecoration: (
		uri: string,

		decoration: FileDecoration,
	) => Promise<void>;

	/** Remove decoration for a URI. */
	readonly ClearDecoration: (
		uri: string,
	) => Promise<void>;
}
