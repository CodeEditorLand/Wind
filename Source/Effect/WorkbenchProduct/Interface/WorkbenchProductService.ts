import type { Effect } from "effect";

import type { WorkbenchProductProblem } from "../Type/WorkbenchProductProblem.js";

export interface WorkbenchProductSnapshot {
	readonly nameLong: string;

	readonly nameShort: string;

	readonly version: string;

	readonly commit: string | null;

	readonly date: string | null;

	readonly quality: string | null;

	readonly applicationName: string;

	readonly extensionsGallery: { readonly serviceUrl: string } | null;
}

export interface WorkbenchProductService {
	readonly Snapshot: Effect.Effect<
		WorkbenchProductSnapshot,
		WorkbenchProductProblem
	>;

	readonly Get: <T = unknown>(
		key: string,
	) => Effect.Effect<T | undefined, WorkbenchProductProblem>;
}
