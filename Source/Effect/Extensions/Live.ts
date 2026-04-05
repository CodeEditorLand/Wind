/**
 * @module Effect/Extensions/Live
 * @description
 * Live implementation of ExtensionsService backed by Mountain's
 * ExtensionManagementService via Tauri IPC.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   extensions:getAll  → GetExtensions()
 *   extensions:get     → GetExtension(id)
 *   extensions:isActive → IsActive(id)
 */

import { Effect, Layer } from "effect";
import { ExtensionsServiceTag } from "./Tag/ExtensionsServiceTag.js";
import type { ExtensionsService } from "./Interface/ExtensionsService.js";
import type { ExtensionsProblem } from "./Type/ExtensionsProblem.js";
import { IPC } from "../IPC.js";

const MakeExtensionsProblem = (error: unknown): ExtensionsProblem =>
	error instanceof Error
		? { _tag: "ExtensionsOperationFailed", error }
		: {
				_tag: "ExtensionsOperationFailed",
				error: new Error(String(error)),
			};

export const LiveExtensionsServiceLayer = Layer.effect(
	ExtensionsServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;

		const Service: ExtensionsService = {
			GetExtension: (id) =>
				IPCService
					.invoke("extensions:get")([id])
					.pipe(
						Effect.map((Result) =>
							Result === null || Result === undefined ? undefined : Result,
						),
						Effect.mapError(MakeExtensionsProblem),
					),

			GetAllExtensions: () =>
				IPCService
					.invoke("extensions:getAll")([])
					.pipe(
						Effect.map((Result) =>
							Array.isArray(Result) ? (Result as readonly unknown[]) : [],
						),
						Effect.mapError(MakeExtensionsProblem),
					),

			IsActive: (id) =>
				IPCService
					.invoke("extensions:isActive")([id])
					.pipe(
						Effect.map((Result) => Boolean(Result)),
						Effect.mapError(MakeExtensionsProblem),
					),

			Activate: (id) =>
				// Extension activation is driven by Mountain/Cocoon on their side.
				// Wind just verifies the extension exists and returns.
				IPCService
					.invoke("extensions:get")([id])
					.pipe(
						Effect.map(() => undefined as void),
						Effect.mapError(MakeExtensionsProblem),
					),
		};

		return Service;
	}),
);

export default LiveExtensionsServiceLayer;
