/**
 * @module Effect/Telemetry/Layer/TelemetryMock
 * @description
 * Mock layer for Telemetry service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Telemetry/Layer/TelemetryLive} Live layer
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @category Layer
 */

import { Effect, Layer, Stream } from "effect";

import type { TelemetryService } from "../Interface/TelemetryService.js";
import TelemetryTag from "../Tag/TelemetryTag.js";
import type { SpanHandle } from "../Type/TelemetryType.js";

/**
 * Creates a mock Telemetry service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock Telemetry service instance
 */
const makeMockTelemetry = (): TelemetryService => ({
	recordMetric: () => Effect.void,
	startSpan: () =>
		Effect.succeed({
			end: () => Effect.void,
		} satisfies SpanHandle),
	log: () => Effect.void,
	events: Stream.empty,
	getMetrics: () => Effect.succeed([]),
	getAverageDuration: () => Effect.succeed(0),
	getSuccessRate: () => Effect.succeed(0),
	flush: Effect.void,
});

/**
 * Mock layer for Telemetry service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { TelemetryMockLive } from "./Effect/Telemetry/Layer/TelemetryMock.js";
 *
 * const testLayer = TelemetryMockLive;
 * ```
 */
const TelemetryMockLive = Layer.succeed(TelemetryTag, makeMockTelemetry());

export default TelemetryMockLive;
export { makeMockTelemetry };
