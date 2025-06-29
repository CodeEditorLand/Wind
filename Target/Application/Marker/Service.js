var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import * as Monaco from "monaco-editor";
import { URI } from "vs/base/common/uri.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IntegrationService } from "../../Integration/Tauri/Service.js";
import { MarkerProblem } from "./Error.js";
class MarkerService extends Effect.Service()(
  "Wind/MarkerService",
  {
    effect: Effect.gen(function* (Generator) {
      const LoggerService = yield* Generator(ILogService);
      const Integration = yield* Generator(IntegrationService);
      const UpdateMarkersForURIs = /* @__PURE__ */ __name((URIs) => Effect.gen(function* (Generator2) {
        LoggerService.trace(
          `[MarkerService] Fetching diagnostics for ${URIs.length} URIs.`
        );
        const DiagnosticsByURI = yield* Generator2(
          Integration.Invoke(
            "GetAllDiagnosticsForURIs",
            { URIs }
          )
        );
        for (const [URIString, Markers] of DiagnosticsByURI) {
          const Model = Monaco.editor.getModel(
            URI.parse(URIString)
          );
          if (Model) {
            const MonacoMarkers = Markers.map(
              (MarkerDTO) => ({
                severity: MarkerDTO.Severity,
                message: MarkerDTO.Message,
                source: MarkerDTO.Source,
                startLineNumber: MarkerDTO.StartLineNumber,
                startColumn: MarkerDTO.StartColumn,
                endLineNumber: MarkerDTO.EndLineNumber,
                endColumn: MarkerDTO.EndColumn
              })
            );
            Monaco.editor.setModelMarkers(
              Model,
              "wind-diagnostics",
              MonacoMarkers
            );
          }
        }
      }).pipe(
        Effect.catchAll(
          (Cause) => Effect.sync(
            () => LoggerService.error(
              "[MarkerService] Failed to update markers:",
              Cause
            )
          )
        )
      ), "UpdateMarkersForURIs");
      const Initialize = /* @__PURE__ */ __name(() => Integration.Listen(
        "sky://diagnostics/changed",
        (Event) => {
          LoggerService.info(
            `[MarkerService] Received diagnostic change from owner '${Event.payload.Owner}'. Updating markers for ${Event.payload.Uris.length} URIs.`
          );
          Effect.runFork(
            UpdateMarkersForURIs(Event.payload.Uris)
          );
        }
      ).pipe(
        Effect.asVoid,
        Effect.mapError(
          (Cause) => new MarkerProblem({
            Cause,
            Context: "ListenerSetupFailed"
          })
        )
      ), "Initialize");
      return { Initialize };
    })
  }
) {
  static {
    __name(this, "MarkerService");
  }
}
export {
  MarkerService
};
//# sourceMappingURL=Service.js.map
