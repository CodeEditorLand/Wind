/**
 * @module Effect/Bootstrap/Interface/BootstrapService
 * @description
 * Service interface for bootstrap orchestration.
 * Manages the startup sequence for the VSCode workbench.
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Default implementation
 * @category Interface
 */

import type {
	BootstrapOptions,
	BootstrapResult,
} from "../Type/BootstrapType.js";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Service interface for Bootstrap orchestration.
 * Coordinates all initialization stages for the VSCode workbench.
 *
 * The bootstrap process includes:
 * - Stage 0: Environment detection
 * - Stage 1: Preload readiness
 * - Stage 2: Configuration loading
 * - Stage 3: Service initialization
 * - Stage 4: Preparation
 * - Stage 5: Initialization
 * - Stage 6: Health checks
 */
export interface BootstrapService {
	/**
	 * Run the bootstrap process with optional configuration.
	 * @param options - Options for controlling bootstrap behavior
	 * @returns Promise resolving to the bootstrap result
	 */
	readonly run: (options?: BootstrapOptions) => Promise<BootstrapResult>;
}
