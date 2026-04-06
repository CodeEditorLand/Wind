import type { Effect } from "effect";

import type { LabelProblem } from "../Type/LabelProblem.js";

/**
 * Label service interface.
 * Microsoft VSCode Reference: ILabelService from vs/platform/label/common/label.ts
 *
 * Resolves human-readable display labels for URIs, workspace folders,
 * and file paths. Used in the explorer tree, tabs, and breadcrumbs.
 */
export interface LabelService {
	/**
	 * Resolve a display label for a URI.
	 * @param uri - The URI to label (e.g. "file:///home/user/project/src/foo.ts")
	 * @param options.relative - When true, return path relative to workspace root
	 */
	readonly GetUriLabel: (
		uri: string,
		options?: { readonly relative?: boolean },
	) => Effect.Effect<string, LabelProblem>;

	/**
	 * Return a human-readable label for the current workspace root.
	 * Returns the workspace folder name, or empty string if no workspace is open.
	 */
	readonly GetWorkspaceLabel: () => Effect.Effect<string, LabelProblem>;

	/**
	 * Return only the base name (filename + extension) of a URI.
	 */
	readonly GetBaseLabel: (uri: string) => Effect.Effect<string, LabelProblem>;
}
