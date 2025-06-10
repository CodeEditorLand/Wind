/**
 * @module Service (Configuration/Application)
 * @description Defines the service interface and Context.Tag for the application-level
 * configuration service, which conforms to the `IConfigurationService` from VS Code.
 */

import { Context } from "effect";
import type { IConfigurationService } from "vs/platform/configuration/common/configuration.js";

/**
 * The service interface for the Configuration service.
 * This is an alias for VS Code's `IConfigurationService` to ensure API compatibility.
 */
export type Interface = IConfigurationService;

/**
 * The Context.Tag for the Configuration service.
 * This tag is used to specify a dependency on the configuration service in the Effect
 * ecosystem, and is identified by the string "vscode/ConfigurationService".
 */
export const Tag = Context.Tag<Interface>("vscode/ConfigurationService");
