/**
 * @module Effect/ActivityBar/Implementation/ActivityBarHelper
 * @description
 * Helper functions for ActivityBar service implementation.
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Main implementation
 * @category Implementation
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique ID for activity bar items.
 */
export const GenerateItemId = (): string =>
	`activitybar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default { GenerateItemId };
