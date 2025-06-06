import { Context } from "effect";
import type { IConfigurationService } from "vs/platform/configuration/common/configuration.js";

export type Interface = IConfigurationService;

const ConfigurationServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/ConfigurationService",
);

export default ConfigurationServiceTag;
