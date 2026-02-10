/**
 * @module Effect/Environment/Tag/EnvironmentTag
 * @description
 * Service tag for dependency injection of the Environment service.
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Implementation
 * @category Tag
 */

import { Context } from "effect";
import type { EnvironmentService } from "../Interface/EnvironmentService.js";

// ============================================================================
// Service Tag
// ============================================================================

/**
 * Environment service tag for dependency injection
 */
export class EnvironmentTag extends Context.Tag(
	"Effect/EnvironmentService",
)<EnvironmentTag, EnvironmentService>() {}

export default EnvironmentTag;
