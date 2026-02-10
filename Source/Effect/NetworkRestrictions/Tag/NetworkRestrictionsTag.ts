/**
 * @module Effect/NetworkRestrictions/Tag/NetworkRestrictionsTag
 * @description
 * Service tag for dependency injection of the NetworkRestrictions service.
 * @see {@link Effect/NetworkRestrictions/Interface/NetworkRestrictionsService} Service interface
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Implementation
 * @category Tag
 */

import { Context } from "effect";
import type { NetworkRestrictionsService } from "../Interface/NetworkRestrictionsService.js";

// ============================================================================
// Service Tag
// ============================================================================

/**
 * NetworkRestrictions service tag for dependency injection
 */
export class NetworkRestrictionsTag extends Context.Tag(
	"NetworkRestrictions",
)<NetworkRestrictionsTag, NetworkRestrictionsService>() {}

/**
 * Alias for the NetworkRestrictions tag
 */
export const NetworkRestrictions = NetworkRestrictionsTag;

export default NetworkRestrictionsTag;
