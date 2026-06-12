import type { StorageProblem } from "../Type/StorageProblem.js";

export interface StorageService {
	readonly Get: (key: string) => unknown;

	readonly Set: (
		key: string,

		value: unknown,
	) => void;

	readonly Delete: (key: string) => void;

	readonly Keys: () => readonly string[];

	readonly GetItems: () => readonly (readonly [string, string])[];

	readonly UpdateItems: (request: {
		readonly insert?:
			| readonly (readonly [string, unknown])[]
			| Readonly<Record<string, unknown>>;

		readonly delete?: readonly string[];
	}) => void;

	readonly Optimize: () => void;
}
