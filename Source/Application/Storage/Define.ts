/**
 * @module Define
 * @description
 * Defines a placeholder for the `IStorageService`. This stub is necessary to
 * satisfy the dependency requirements of the `EditorGroupService` and will be
 * fully implemented in a later step.
 */

import type { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { Effect } from "effect";

export class StorageService extends Effect.Service<IStorageService>()(
	"storageService",
	{
		sync: () =>
			({
				get: () => undefined,
				store: () => {},
			}) as any,
	},
) {}
