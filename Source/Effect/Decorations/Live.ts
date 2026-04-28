/**
 * @module Effect/Decorations/Live
 * @description
 * Live implementation of DecorationsService backed by Mountain's decoration
 * store via Tauri IPC. File badges (git dirty, errors) shown in the explorer
 * tree are driven by this service.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   decorations:get       → get decoration for one URI
 *   decorations:getMany   → get decorations for multiple URIs
 *   decorations:set       → register / override decoration for a URI
 *   decorations:clear     → remove decoration for a URI
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { IPC } from "../IPC.js";
import type {
	DecorationsService,
	FileDecoration,
} from "./Interface/DecorationsService.js";
import { DecorationsServiceTag } from "./Tag/DecorationsServiceTag.js";
import type { DecorationsProblem } from "./Type/DecorationsProblem.js";

const MakeDecorationsProblem = (error: unknown): DecorationsProblem => ({
	_tag: "DecorationsOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

export const LiveDecorationsServiceLayer = Layer.effect(
	DecorationsServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;

		const Service: DecorationsService = {
			GetDecoration: (uri, includeChildren) =>
				IPCService.invoke(Channel.DecorationsGet)([
					uri,
					includeChildren,
				]).pipe(
					Effect.map((Result) =>
						Result != null ? (Result as FileDecoration) : null,
					),
					Effect.mapError(MakeDecorationsProblem),
				),

			GetDecorations: (uris) =>
				IPCService.invoke(Channel.DecorationsGetMany)([uris]).pipe(
					Effect.map((Result) => {
						const Map_ = new Map<string, FileDecoration>();
						if (Result != null && typeof Result === "object") {
							for (const [Key, Value] of Object.entries(
								Result as Record<string, FileDecoration>,
							)) {
								Map_.set(Key, Value);
							}
						}
						return Map_ as ReadonlyMap<string, FileDecoration>;
					}),
					Effect.mapError(MakeDecorationsProblem),
				),

			SetDecoration: (uri, decoration) =>
				IPCService.invoke(Channel.DecorationsSet)([
					uri,
					decoration,
				]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeDecorationsProblem),
				),

			ClearDecoration: (uri) =>
				IPCService.invoke(Channel.DecorationsClear)([uri]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeDecorationsProblem),
				),
		};

		return Service;
	}),
);

export default LiveDecorationsServiceLayer;
