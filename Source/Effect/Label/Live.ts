/**
 * @module Effect/Label/Live
 * @description
 * Live implementation of LabelService backed by Mountain via Tauri IPC.
 * Resolves human-readable labels for URIs, workspace roots, and filenames.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   label:getUri        → resolve display label for a URI
 *   label:getWorkspace  → current workspace root label
 *   label:getBase       → basename of a URI
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { IPC } from "../IPC.js";
import type { LabelService } from "./Interface/LabelService.js";
import { LabelServiceTag } from "./Tag/LabelServiceTag.js";
import type { LabelProblem } from "./Type/LabelProblem.js";

const MakeLabelProblem = (error: unknown): LabelProblem => ({
	_tag: "LabelOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

export const LiveLabelServiceLayer = Layer.effect(
	LabelServiceTag,

	Effect.gen(function* () {
		const IPCService = yield* IPC;

		const Service: LabelService = {
			GetUriLabel: (uri, options) =>
				IPCService.invoke(Channel.LabelGetURI)([
					uri,

					options?.relative ?? false,
				]).pipe(
					Effect.map((Result) =>
						typeof Result === "string" ? Result : uri,
					),

					Effect.mapError(MakeLabelProblem),
				),

			GetWorkspaceLabel: () =>
				IPCService.invoke(Channel.LabelGetWorkspace)([]).pipe(
					Effect.map((Result) =>
						typeof Result === "string" ? Result : "",
					),

					Effect.mapError(MakeLabelProblem),
				),

			GetBaseLabel: (uri) =>
				IPCService.invoke(Channel.LabelGetBase)([uri]).pipe(
					Effect.map((Result) =>
						typeof Result === "string"
							? Result
							: (uri.split("/").pop() ?? uri),
					),

					Effect.mapError(MakeLabelProblem),
				),
		};

		return Service;
	}),
);

export default LiveLabelServiceLayer;
