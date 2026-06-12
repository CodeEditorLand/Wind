import type { Effect } from "effect";

import type { StorageProblem } from "../Type/StorageProblem.js";

export interface StorageService {

	readonly Get: (key: string) => Effect.Effect<unknown, StorageProblem>;

	readonly Set: (
		key: string,

		value: unknown,
	) => Effect.Effect<void, StorageProblem>;

	readonly Delete: (key: string) => Effect.Effect<void, StorageProblem>;

	readonly Keys: () => Effect.Effect<readonly string[], StorageProblem>;

	readonly GetItems: () => Effect.Effect<
		readonly (readonly [string, string])[],

		StorageProblem
	>;

	readonly UpdateItems: (request: {
		readonly insert?:
			| readonly (readonly [string, unknown])[]
			| Readonly<Record<string, unknown>>;

		readonly delete?: readonly string[];
	}) => Effect.Effect<void, StorageProblem>;

	readonly Optimize: () => Effect.Effect<void, StorageProblem>;
}
