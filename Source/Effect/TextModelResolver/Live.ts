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

import { Effect, Layer } from "effect";

import { ModelServiceInstance } from "../Model/Live.js";
import type { TextModelResolverService } from "./Interface/TextModelResolverService.js";
import { TextModelResolverServiceTag } from "./Tag/TextModelResolverServiceTag.js";
import type { TextModelResolverProblem } from "./Type/TextModelResolverProblem.js";

const MakeResolverProblem = (error: unknown): TextModelResolverProblem => ({
	_tag: "TextModelResolverOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeTextModelResolverService(): TextModelResolverService {
	const ModelService = ModelServiceInstance;

	// Simple reference counter: uri → open count
	const RefCounts = new Map<string, number>();

	const Service: TextModelResolverService = {
		Resolve: (uri) =>
			ModelService.OpenModel(uri).pipe(
				Effect.map((Model) => {
					// Increment reference count
					RefCounts.set(uri, (RefCounts.get(uri) ?? 0) + 1);

					return {
						model: Model,
						dispose: () => {
							const Count = (RefCounts.get(uri) ?? 1) - 1;

							if (Count <= 0) {
								RefCounts.delete(uri);

								// Fire-and-forget close when ref count drops to zero
								void Effect.runPromise(
									ModelService.CloseModel(uri),
								).catch(() => {});
							} else {
								RefCounts.set(uri, Count);
							}
						},
					};
				}),

				Effect.mapError(MakeResolverProblem),
			),

		HasModel: (uri) =>
			ModelService.GetModel(uri).pipe(
				Effect.map((Result) => Result !== null),

				Effect.mapError(MakeResolverProblem),
			),

		Reload: (uri) =>
			// Re-open (Mountain always reads from disk on open)
			ModelService.OpenModel(uri).pipe(
				Effect.mapError(MakeResolverProblem),
			),
	};

	return Service;
}

export const LiveTextModelResolverServiceLayer = Layer.succeed(
	TextModelResolverServiceTag,

	makeTextModelResolverService(),
);

export default LiveTextModelResolverServiceLayer;
