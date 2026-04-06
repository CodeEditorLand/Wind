import type { Event, IDisposable } from "../Type/VSCodeCommonType.js";
import type {
	ConfigurationTarget,
	IConfigurationChangeEvent,
} from "../Type/VSCodeConfigurationType.js";
import type { URI } from "../Type/VSCodeUtilityType.js";

/**
 * VSCode Configuration Service interface
 */
export interface IVSCodeConfigurationService {
	_serviceBrand: undefined;
	onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
	getValue<T>(section?: string): T;
	updateValue(
		key: string,
		value: any,
		target?: ConfigurationTarget,
	): Promise<void>;
	inspect<T>(key: string): {
		default: T;
		user: T;
		workspace?: T;
		workspaceFolder?: T;
		memory?: T;
	};
}
