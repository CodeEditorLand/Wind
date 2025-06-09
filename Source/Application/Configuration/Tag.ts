/*
 * File: Wind/Source/Application/Configuration/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:45 UTC
 * Dependency: effect, vs/platform/configuration/common/configuration.js
 * Export: Interface
 */

import { Context } from "effect";
import type { IConfigurationService } from "vs/platform/configuration/common/configuration.js";

export type Interface = IConfigurationService;

const ConfigurationServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/ConfigurationService",
);

export default ConfigurationServiceTag;
