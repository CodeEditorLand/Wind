import type { Effect } from "effect";

import type { TextModel } from "../../Model/Interface/ModelService.js";
import type { TextModelResolverProblem } from "../Type/TextModelResolverProblem.js";

/**
 * TextModelResolver service interface.
 * Microsoft VSCode Reference: ITextModelService from vs/editor/common/services/resolverService.ts
 *
 * Resolves URIs to text model references, managing the lifecycle of
 * text model objects used by the Monaco editor and language services.
 * Acts as the bridge between URI-based document references and the in-memory
 * model registry.
 */
export interface TextModelResolverService {
	/**
	 * Resolve a URI to a text model reference.
	 * Opens the model if not already open (delegates to ModelService).
	 * Returns an IReference-like object with the model and a dispose function.
	 */
	readonly Resolve: (uri: string) => Effect.Effect<
		{
			readonly model: TextModel;
			readonly dispose: () => void;
		},
		TextModelResolverProblem
	>;

	/**
	 * Check if a model reference exists for the given URI.
	 */
	readonly HasModel: (
		uri: string,
	) => Effect.Effect<boolean, TextModelResolverProblem>;

	/**
	 * Force-reload a model's content from disk (via Mountain).
	 */
	readonly Reload: (uri: string) => Effect.Effect<TextModel, TextModelResolverProblem>;
}
