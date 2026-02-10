/**
 * @module Effect/Telemetry/Helper/withSpan
 * @description
 * Helper function to wrap an effect with automatic span tracking.
 * Creates a span before the effect and ends it after completion, recording success/failure.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Helper/withMetric} Metric helper
 * @category Helper
 */

import { Effect } from "effect";
import { Telemetry } from "../../Telemetry.js";

/**
 * Wraps an effect with automatic span tracking.
 * Creates a span before the effect, tracks its duration, and records success/failure.
 *
 * @param name - Name of the operation being tracked
 * @param effect - The effect to wrap
 * @param labels - Optional labels to attach to the span
 * @returns The wrapped effect with automatic span tracking
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { withSpan } from "./Effect/Telemetry/Helper/withSpan.js";
 *
 * const fetchData = withSpan(
 *   "fetchData",
 *   Effect.tryPromise(() => fetch('/api/data'))
 * );
 * ```
 */
export default function withSpan<A, E, R>(
	name: string,
	effect: Effect.Effect<A, E, R>,
	labels?: Record<string, string>,
) {
	return Effect.gen(function* () {
		const telemetry = yield* Telemetry;
		const span = yield* telemetry.startSpan(name, labels);

		return effect.pipe(
			Effect.tap(() => span.end(true)),
			Effect.catchAll((error) =>
				Effect.gen(function* () {
					yield* span.end(false, String(error));
					return yield* Effect.fail(error);
				}),
			),
		);
	});
}
