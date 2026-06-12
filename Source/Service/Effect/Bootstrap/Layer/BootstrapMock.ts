/**
 * @module Effect/Bootstrap/Layer/BootstrapMock
 * @description
 * Mock implementation of the Bootstrap service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Live implementation
 * @category Layer
 */

import type { BootstrapService } from "../Interface/BootstrapService.js";
import type { BootstrapResult } from "../Type/BootstrapType.js";

// ============================================================================
// Mock Implementation
// ============================================================================

/**
 * Creates a mock bootstrap service for testing.
 */
export const makeMockBootstrap = (): BootstrapService => ({
	run: async (options) => {
		await new Promise((Resolve) => {
			setTimeout(Resolve, 1);
		});

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
	},
});

/**
 * Mock Bootstrap service.
 * Provides simple no-op implementation for testing.
 */
export const BootstrapMock: BootstrapService = makeMockBootstrap();

export default BootstrapMock;
