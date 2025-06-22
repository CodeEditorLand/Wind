/*
 * File: Wind/Source/Application/Marker/Service.ts
 * Role: Defines the MarkerService, which listens for diagnostic changes from the
 *       backend and updates the Monaco Editor's model markers.
 * Responsibilities:
 *   - Provide the service interface and Context.Tag for the MarkerService.
 *   - Implement the live version of the service as an Effect-TS Layer.
 *   - Listen for `sky://diagnostics/changed` events from Mountain.
 *   - Fetch updated diagnostic data from Mountain for the affected URIs.
 *   - Update the Monaco editor markers accordingly.
 */

import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { Context, Effect, Layer } from "effect";
import * as Monaco from "monaco-editor";
import { URI } from "vs/base/common/uri.js";
import { ILogService } from "vs/platform/log/common/log.js";

// The DTO for a single marker from Mountain
interface MarkerDataDTO {
	readonly Severity: number;

	readonly Message: string;

	readonly Source?: string;

	readonly StartLineNumber: number;

	readonly StartColumn: number;

	readonly EndLineNumber: number;

	readonly EndColumn: number;
}

/**
 * The MarkerService is responsible for managing diagnostic markers
 * (errors, warnings, etc.) in the editor.
 */
export class MarkerService extends Context.Tag("Wind/MarkerService")<
	MarkerService,
	{
		/**
		 * Initializes the service, registering all necessary event listeners to react
		 * to changes from the backend.
		 */
		readonly Initialize: () => Effect.Effect<void, never>;
	}
>() {}

/**
 * The live implementation of the MarkerService.
 */
export const Live = Layer.effect(
	MarkerService,

	Effect.gen(function* (_) {
		const LogService = yield* _(ILogService);

		/**
		 * An Effect that fetches all diagnostics for a given set of URIs and
		 * updates the corresponding Monaco editor models.
		 */
		const UpdateMarkersForURIs = (URIs: readonly string[]) =>
			Effect.gen(function* (_) {
				LogService.trace(
					`[MarkerService] Fetching diagnostics for ${URIs.length} URIs.`,
				);

				const DiagnosticsByURI = yield* _(
					Effect.tryPromise({
						try: () =>
							invoke<[string, MarkerDataDTO[]][]>(
								"GetAllDiagnosticsForURIs",

								{ URIs },
							),

						catch: (UnknownError) =>
							new Error(
								`Tauri invocation for 'GetAllDiagnosticsForURIs' failed: ${UnknownError}`,
							),
					}),
				);

				for (const [URIString, Markers] of DiagnosticsByURI) {
					const Model = Monaco.editor.getModel(URI.parse(URIString));

					if (Model) {
						const MonacoMarkers = Markers.map(
							(MarkerDTO): Monaco.editor.IMarkerData => ({
								severity: MarkerDTO.Severity,

								message: MarkerDTO.Message,

								source: MarkerDTO.Source,

								startLineNumber: MarkerDTO.StartLineNumber,

								startColumn: MarkerDTO.StartColumn,

								endLineNumber: MarkerDTO.EndLineNumber,

								endColumn: MarkerDTO.EndColumn,
							}),
						);

						// The owner 'wind-diagnostics' is a general owner for this client.
						Monaco.editor.setModelMarkers(
							Model,

							"wind-diagnostics",

							MonacoMarkers,
						);
					}
				}
			}).pipe(
				Effect.catchAll((Error) =>
					Effect.sync(() =>
						LogService.error(
							"[MarkerService] Failed to update markers:",

							Error,
						),
					),
				),
			);

		const Initialize = (): Effect.Effect<void, never> =>
			Effect.tryPromise({
				try: () =>
					listen<{ Owner: string; Uris: string[] }>(
						"sky://diagnostics/changed",

						(Event) => {
							LogService.info(
								`[MarkerService] Received diagnostic change from owner '${Event.payload.Owner}'. Updating markers for ${Event.payload.Uris.length} URIs.`,
							);

							// Fork the update effect so it doesn't block the listener thread.
							Effect.runFork(
								UpdateMarkersForURIs(Event.payload.Uris),
							);
						},
					),

				catch: (Error) =>
					new Error(
						`Failed to set up listener for diagnostic changes: ${Error}`,
					),
			}).pipe(
				Effect.tapError((Error) =>
					Effect.sync(() => LogService.error(Error.message)),
				),

				// Ignore failure to listen, as it's a startup operation.
				Effect.ignore,
			);

		return MarkerService.of({
			Initialize,
		});
	}),
);
