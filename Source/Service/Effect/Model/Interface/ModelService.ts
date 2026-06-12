import type { ModelProblem } from "../Type/ModelProblem.js";

/**
 * Text model entry held by the model registry.
 */
export interface TextModel {
	/** URI identifying this text document. */
	readonly uri: string;

	/** Current text content of the model. */
	readonly content: string;

	/** Monotonically increasing version number, incremented on each edit. */
	readonly version: number;

	/** Language identifier (e.g. "typescript", "rust", "json"). */
	readonly languageId: string;
}

/**
 * Model service interface - lightweight in-memory text model registry.
 * Microsoft VSCode Reference: IModelService from vs/editor/common/services/model.ts
 *
 * Maintains a registry of open text documents and their content/version.
 * The registry is kept in sync with Mountain's document state via IPC.
 */
export interface ModelService {
	/**
	 * Open (or retrieve if already open) a text model for a URI.
	 * Mountain reads the file and returns content + language id.
	 */
	readonly OpenModel: (uri: string) => Promise<TextModel>;

	/**
	 * Close and remove a model from the registry.
	 */
	readonly CloseModel: (uri: string) => Promise<void>;

	/**
	 * Get the current model for a URI without opening it.
	 * Returns null if the model is not currently registered.
	 */
	readonly GetModel: (uri: string) => Promise<TextModel | null>;

	/**
	 * Return all currently open text models.
	 */
	readonly GetAllModels: () => Promise<readonly TextModel[]>;

	/**
	 * Update the content of an open model (increments its version).
	 */
	readonly UpdateContent: (
		uri: string,

		content: string,
	) => Promise<TextModel>;
}
