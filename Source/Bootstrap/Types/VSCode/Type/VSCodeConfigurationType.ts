/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeConfigurationType
 * @description
 * Configuration-related types for VSCode service.
 * @see {@link Bootstrap/Types/VSCode/Interface/VSCodeConfigurationService} Related service interface
 * @category Type
 */

import type { UriComponents } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/uri.js";

// ConfigurationTarget from the real VS Code source - prevents enum drift.
export { ConfigurationTarget } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/api/common/extHostTypes.js";

// Shared structural types - re-exported from VSCodeCommonType to avoid duplicates.
export type { Event, IDisposable } from "./VSCodeCommonType.js";

/**
 * Configuration change event interface.
 */
export interface IConfigurationChangeEvent {

	affectsConfiguration(section: string, resource?: UriComponents): boolean;
}
