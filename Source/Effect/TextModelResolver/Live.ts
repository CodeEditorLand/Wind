/**
 * @module Effect/TextModelResolver/Live
 * @description
 * Live implementation of TextModelResolverService. Delegates to the
 * ModelService for open/close lifecycle and adds a reference-counting
 * dispose pattern compatible with VS Code's IReference<ITextModel>.
 *
 * IPC channels used indirectly via ModelService:
 *   model:open          → open a document and return TextModel
 *   model:get           → check if model exists
 *   model:close         → release on dispose
 *   model:updateContent → force-reload content from Mountain
 */

import { Effect } from "effect";

import type { TextModel } from "../Model/Interface/ModelService.js";
import { ModelServiceInstance } from "../Model/Live.js";
import type { TextModelResolverService } from "./Interface/TextModelResolverService.js";

function makeTextModelResolverService(): TextModelResolverService {
	const ModelService = ModelServiceInstance;

	// Simple reference counter: uri → open count
	const RefCounts = new Map<string, number>();

	// Bridge: ModelService methods still return Effect.Effect until EFX Phase N.
	// Use runPromise to convert to plain Promise for this service.
	const OpenModel = (uri: string): Promise<TextModel> =>
		Effect.runPromise(ModelService.OpenModel(uri));

	const GetModel = (uri: string): Promise<TextModel | null> =>
		Effect.runPromise(ModelService.GetModel(uri));

	const CloseModel = (uri: string): Promise<void> =>
		Effect.runPromise(ModelService.CloseModel(uri));

	const Service: TextModelResolverService = {
		Resolve: async (uri) => {
			const Model = await OpenModel(uri);

			// Increment reference count
			RefCounts.set(uri, (RefCounts.get(uri) ?? 0) + 1);

			return {
				model: Model,
				dispose: () => {
					const Count = (RefCounts.get(uri) ?? 1) - 1;

					if (Count <= 0) {
						RefCounts.delete(uri);

						// Fire-and-forget close when ref count drops to zero
						void CloseModel(uri).catch(() => {});
					} else {
						RefCounts.set(uri, Count);
					}
				},
			};
		},

		HasModel: async (uri) => {
			const Result = await GetModel(uri);

			return Result !== null;
		},

		Reload: async (uri) =>
			// Re-open (Mountain always reads from disk on open)
			OpenModel(uri),
	};

	return Service;
}

export const LiveTextModelResolverServiceLayer =
	makeTextModelResolverService();

export default LiveTextModelResolverServiceLayer;
