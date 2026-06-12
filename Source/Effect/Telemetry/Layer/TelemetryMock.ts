/**
 * @module Effect/Telemetry/Layer/TelemetryMock
 * @description
 * Mock layer for Telemetry service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Telemetry/Layer/TelemetryLive} Live layer
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @category Layer
 */

import type { TelemetryService } from "../Interface/TelemetryService.js";
import type { SpanHandle } from "../Type/TelemetryType.js";

const emptyStream = new ReadableStream<never>({
	start(controller) {
		controller.close();
	}
});

/**
 * Creates a mock Telemetry service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock Telemetry service instance
 */
const makeMockTelemetry = (): TelemetryService => ({
	recordMetric: () => Promise.resolve(),
	startSpan: () =>
		Promise.resolve({
			end: () => Promise.resolve(),
		} satisfies SpanHandle),
	log: () => Promise.resolve(),
	events: emptyStream,
	getMetrics: () => Promise.resolve([]),
	getAverageDuration: () => Promise.resolve(0),
	getSuccessRate: () => Promise.resolve(0),
	flush: Promise.resolve(),
});

/**
 * Mock layer for Telemetry service.
 * Provides a no-op implementation for testing without dependencies.
 */
const TelemetryMockLive = makeMockTelemetry();

export default TelemetryMockLive;

export { makeMockTelemetry };
