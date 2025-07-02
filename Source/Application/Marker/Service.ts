/**
 * @module Service (Application/Marker)
 * @description Defines the MarkerService, which listens for diagnostic changes from the
 * backend and updates the Monaco Editor's model markers.
 */

import { Effect } from "effect";
import * as Monaco from "monaco-editor";
import { URI } from "@codeeditorland/output/vs/base/common/uri.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import type { IMarkerData } from "@codeeditorland/output/vs/platform/markers/common/markers.js";

import { IntegrationService } from "../../Integration/Tauri/Service.js";
import { MarkerProblem } from "./Error.js";

/**
 * The DTO for a single marker received from the Mountain host.
 */
export interface MarkerDataDTO {
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
export interface Marker {
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
		effect: Effect.gen(function* () {
			const LoggerService = yield* ILogService;
			const Integration = yield* IntegrationService;

			/**
			 * An `Effect` that fetches all diagnostics for a given set of URIs from
			 * the host and updates the corresponding Monaco editor models.
			 */
			const UpdateMarkersForURIs = (URIs: readonly string[]) =>
				Effect.gen(function* () {
					LoggerService.trace(
						`[MarkerService] Fetching diagnostics for ${URIs.length} URIs.`,
					);

					const DiagnosticsByURI = yield* Integration.Invoke<
						[string, MarkerDataDTO[]][]
					>("GetAllDiagnosticsForURIs", { URIs });

					for (const [URIString, Markers] of DiagnosticsByURI) {
						const Model = Monaco.editor.getModel(
							URI.parse(URIString),
						);

						if (Model) {
							const MonacoMarkers: IMarkerData[] = Markers.map(
								(MarkerDTO) => ({
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
							LoggerService.error(
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
						LoggerService.info(
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
