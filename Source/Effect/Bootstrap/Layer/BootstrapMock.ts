/**
 * @module Effect/Bootstrap/Layer/BootstrapMock
 * @description
 * Mock implementation layer for Bootstrap service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Live implementation
 * @see [Effect-TS Mocking](https://effect.website/docs/guide/testing)
 * @category Layer
 */

import { Effect, Layer } from "effect";

import type { BootstrapService } from "../Interface/BootstrapService.js";
import { BootstrapTag } from "../Tag/BootstrapTag.js";
import type {
	BootstrapOptions,
	BootstrapResult,
	StageResult,
} from "../Type/BootstrapType.js";

// ============================================================================
// Mock Implementation
// ============================================================================

/**
 * Creates a mock bootstrap service for testing.
 */
export const makeMockBootstrap = (): BootstrapService => ({
	run: (options) =>
		Effect.gen(function* () {
			yield* Effect.sleep("1 millis");

			return {
				success: true,
				totalDuration: 1,
				stages: [
					{
						stageName: "Environment",
						success: true,
						duration: 0,
						error: undefined,
					},
					{
						stageName: "Preload",
						success: true,
						duration: 0,
						error: undefined,
					},
					{
						stageName: "Configuration",
						success: true,
						duration: 0,
						error: undefined,
					},
					{
						stageName: "Services",
						success: true,
						duration: 0,
						error: undefined,
					},
					{
						stageName: "Preparation",
						success: true,
						duration: 0,
						error: undefined,
					},
					{
						stageName: "Initialization",
						success: true,
						duration: 0,
						error: undefined,
					},
					...(options?.skipHealthCheck
						? []
						: [
								{
									stageName: "HealthCheck",
									success: true,
									duration: 0,
									error: undefined,
								},
							]),
				],
				error: undefined,
			} satisfies BootstrapResult;
		}),
});

/**
 * Mock implementation layer for Bootstrap service.
 * Provides simple no-op implementation for testing.
 */
export const BootstrapMock = Layer.effect(
	BootstrapTag,

	Effect.succeed(makeMockBootstrap()),
);

export default BootstrapMock;
