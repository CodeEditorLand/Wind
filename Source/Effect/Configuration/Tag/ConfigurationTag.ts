/**
 * @module Effect/Configuration/Tag/ConfigurationTag
 * @description
 * Type alias for `ConfigurationService`. The live service object is
 * exported from the Implementation module as `ConfigurationLive`.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @category Tag
 */

import type { ConfigurationService } from "../Interface/ConfigurationService.js";

export type ConfigurationTag = ConfigurationService;
