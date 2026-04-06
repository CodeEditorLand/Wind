import type { Effect } from "effect";

import type { ExtensionsProblem } from "../Type/ExtensionsProblem.js";

/**
 * Extensions service interface
 * Microsoft VSCode Reference: IExtensionService from vs/workbench/services/extensions/common/extensions.ts
 */
export interface ExtensionsService {
	readonly GetExtension: (
		id: string,
	) => Effect.Effect<unknown | undefined, ExtensionsProblem>;
	readonly GetAllExtensions: () => Effect.Effect<
		readonly unknown[],
		ExtensionsProblem
	>;
	readonly IsActive: (
		id: string,
	) => Effect.Effect<boolean, ExtensionsProblem>;
	readonly Activate: (id: string) => Effect.Effect<void, ExtensionsProblem>;
}
