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

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { IPC } from "../IPC.js";
import type { ModelService, TextModel } from "./Interface/ModelService.js";
import { ModelServiceTag } from "./Tag/ModelServiceTag.js";
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

export const LiveModelServiceLayer = Layer.effect(
	ModelServiceTag,

	Effect.gen(function* () {
		const IPCService = yield* IPC;

		const Service: ModelService = {
			OpenModel: (uri) =>
				IPCService.invoke(Channel.ModelOpen)([uri]).pipe(
					Effect.mapError(MakeModelProblem),

					Effect.flatMap((Result) => {
						const Parsed = ParseTextModel(Result);
						return Parsed
							? Effect.succeed(Parsed)
							: Effect.fail({
									_tag: "ModelOperationFailed" as const,
									error: new Error(
										`model:open returned invalid shape for ${uri}`,
									),
								} satisfies ModelProblem);
					}),
				),

			CloseModel: (uri) =>
				IPCService.invoke(Channel.ModelClose)([uri]).pipe(
					Effect.map(() => undefined as void),

					Effect.mapError(MakeModelProblem),
				),

			GetModel: (uri) =>
				IPCService.invoke(Channel.ModelGet)([uri]).pipe(
					Effect.map((Result) => ParseTextModel(Result)),

					Effect.mapError(MakeModelProblem),
				),

			GetAllModels: () =>
				IPCService.invoke(Channel.ModelGetAll)([]).pipe(
					Effect.map((Result) => {
						if (!Array.isArray(Result))
							return [] as readonly TextModel[];
						return Result.flatMap((Item) => {
							const Parsed = ParseTextModel(Item);
							return Parsed ? [Parsed] : [];
						}) as readonly TextModel[];
					}),

					Effect.mapError(MakeModelProblem),
				),

			UpdateContent: (uri, content) =>
				IPCService.invoke(Channel.ModelUpdateContent)([
					uri,

					content,
				]).pipe(
					Effect.mapError(MakeModelProblem),

					Effect.flatMap((Result) => {
						const Parsed = ParseTextModel(Result);
						return Parsed
							? Effect.succeed(Parsed)
							: Effect.fail({
									_tag: "ModelOperationFailed" as const,
									error: new Error(
										`model:updateContent returned invalid shape for ${uri}`,
									),
								} satisfies ModelProblem);
					}),
				),
		};

		return Service;
	}),
);

export default LiveModelServiceLayer;
