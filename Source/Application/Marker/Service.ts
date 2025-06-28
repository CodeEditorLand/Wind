/**
 * @module Service (Application/Marker)
 * @description Defines the MarkerService, which listens for diagnostic changes from the
 * backend and updates the Monaco Editor's model markers.
 */

import { Effect } from "effect";
import * as Monaco from "monaco-editor";
import { URI } from "vs/base/common/uri.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { MarkerProblem } from "./Error.js";

/**
 * The DTO for a single marker received from the Mountain host.
 */
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
 * The contract for the MarkerService. Its primary job is to listen for
 * backend events and orchestrate updates to the editor UI.
 */
interface Marker {
	/**
	 * Initializes the service, registering all necessary event listeners to react
	 * to changes from the backend. This is an Effect that runs once at startup.
	 */
	readonly Initialize: () => Effect.Effect<void, MarkerProblem>;
}

/**
 * The `Effect.Service` for the `MarkerService`.
 */
export class MarkerService extends Effect.Service<Marker>()(
	"Wind/MarkerService",
	{
		effect: Effect.gen(function* (Generator) {
			const LogService = yield* Generator(ILogService);
			const Integration = yield* Generator(IntegrationService);

			/**
			 * An `Effect` that fetches all diagnostics for a given set of URIs from
			 * the host and updates the corresponding Monaco editor models.
			 */
			const UpdateMarkersForURIs = (URIs: readonly string[]) =>
				Effect.gen(function* (Generator) {
					LogService.trace(
						`[MarkerService] Fetching diagnostics for ${URIs.length} URIs.`,
					);

					const DiagnosticsByURI = yield* Generator(
						Integration.Invoke<[string, MarkerDataDTO[]][]>(
							"GetAllDiagnosticsForURIs",
							{ URIs },
						),
					);

					for (const [URIString, Markers] of DiagnosticsByURI) {
						const Model = Monaco.editor.getModel(
							URI.parse(URIString),
						);

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
					Effect.catchAll((Cause) =>
						Effect.sync(() =>
							LogService.error(
								"[MarkerService] Failed to update markers:",
								Cause,
							),
						),
					),
				);

			const Initialize = (): Effect.Effect<void, MarkerProblem> =>
				Integration.Listen<{ Owner: string; Uris: string[] }>(
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
				).pipe(
					Effect.asVoid,
					Effect.mapError(
						(Cause) =>
							new MarkerProblem({
								Cause,
								Context: "ListenerSetupFailed",
							}),
					),
				);

			return { Initialize };
		}),
	},
) {}
