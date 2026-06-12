/**
 * @module Effect/Model/Live
 * @description
 * Live implementation of ModelService backed by Mountain's document state
 * via Tauri IPC. Maintains an in-memory registry of open text models.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   model:open          → open a document and return { uri, content, version, languageId }
 *   model:close         → remove a document from Mountain's open-doc registry
 *   model:get           → return the current snapshot of an open document
 *   model:getAll        → return all currently open documents
 *   model:updateContent → update content and increment version
 */

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { ModelService, TextModel } from "./Interface/ModelService.js";
import type { ModelProblem } from "./Type/ModelProblem.js";

const MakeModelProblem = (error: unknown): ModelProblem => ({
	_tag: "ModelOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

const ParseTextModel = (raw: unknown): TextModel | null => {
	if (raw == null || typeof raw !== "object") return null;

	const R = raw as Record<string, unknown>;

	if (typeof R["uri"] !== "string") return null;

	return {
		uri: R["uri"] as string,

		content:
			typeof R["content"] === "string" ? (R["content"] as string) : "",

		version:
			typeof R["version"] === "number" ? (R["version"] as number) : 1,

		languageId:
			typeof R["languageId"] === "string"
				? (R["languageId"] as string)
				: "plaintext",
	};
};

function makeModelService(): ModelService {
	const IPCService = TauriIPCLive;

	const Service: ModelService = {
		OpenModel: async (uri) => {
			const Result = await IPCService.invoke(Channel.ModelOpen)([uri]);

			const Parsed = ParseTextModel(Result);

			if (!Parsed) {
				throw MakeModelProblem(
					new Error(`model:open returned invalid shape for ${uri}`),
				);
			}

			return Parsed;
		},

		CloseModel: async (uri) => {
			await IPCService.invoke(Channel.ModelClose)([uri]);
		},

		GetModel: async (uri) => {
			const Result = await IPCService.invoke(Channel.ModelGet)([uri]);

			return ParseTextModel(Result);
		},

		GetAllModels: async () => {
			const Result = await IPCService.invoke(Channel.ModelGetAll)([]);

			if (!Array.isArray(Result)) return [];

			return Result.flatMap((Item) => {
				const Parsed = ParseTextModel(Item);

				return Parsed ? [Parsed] : [];
			});
		},

		UpdateContent: async (uri, content) => {
			const Result = await IPCService.invoke(Channel.ModelUpdateContent)([
				uri,

				content,
			]);

			const Parsed = ParseTextModel(Result);

			if (!Parsed) {
				throw MakeModelProblem(
					new Error(
						`model:updateContent returned invalid shape for ${uri}`,
					),
				);
			}

			return Parsed;
		},
	};

	return Service;
}

export const LiveModelService = makeModelService();

export default LiveModelService;
