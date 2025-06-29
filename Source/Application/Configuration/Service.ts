/**
 * @module Service (Application/Configuration)
 * @description Defines the service interface and live implementation for the
 * application-level configuration service, which conforms to the `IConfigurationService`
 * contract from VS Code.
 */

import { deepmerge } from "deepmerge-ts";
import { Effect } from "effect";
import { Emitter } from "vs/base/common/event.js";
import { joinPath } from "vs/base/common/resources.js";
import type {
	IConfigurationChangeEvent,
	IConfigurationOverrides,
	IConfigurationService,
	IConfigurationValue,
} from "vs/platform/configuration/common/configuration.js";

import type { IntegrationConfigurationProblem } from "../../Integration/Tauri/Configuration/Error.js";
import { ParseJSON } from "../../Integration/Tauri/File/ParseJSON.js";
import { ReadRawFile } from "../../Integration/Tauri/File/ReadRawFile.js";
import { ResolveFinalDefaultPath } from "../../Integration/Tauri/Path/Default.js";
import type { IntegrationPathProblem } from "../../Integration/Tauri/Path/Error.js";
import { ResolveWorkSpacePath } from "../../Integration/Tauri/Path/WorkSpace.js";
import type { Uri } from "../../Platform/VSCode/Type.js";
import { ApplicationConfigurationProblem } from "./Error.js";

/**
 * A robust helper function to retrieve a nested property from a configuration
 * object using a dot-separated key string.
 *
 * @param ConfigurationObject - The root configuration object.
 * @param Key - The dot-separated key (e.g., 'workbench.editor.fontSize').
 * @returns The value if found, otherwise `undefined`.
 */
const GetValueFromObject = (
	ConfigurationObject: object,
	Key: string,
): unknown => {
	if (
		typeof ConfigurationObject !== "object" ||
		ConfigurationObject === null
	) {
		return undefined;
	}
	return Key.split(".").reduce(
		(Current, Part) => (Current as any)?.[Part],
		ConfigurationObject,
	);
};

/**
 * The `Effect.Service` for the `IConfigurationService`.
 *
 * This service provides a read-only view of the application's merged settings.
 * The implementation is provided directly using the `effect` constructor. It
 * fetches and merges all configuration sources upon initialization, making the
 * final configuration available synchronously to the rest of the application.
 */
export class Configuration extends Effect.Service<IConfigurationService>()(
	"vscode/ConfigurationService",
	{
		effect: Effect.gen(function* () {
			/**
			 * An `Effect` that resolves a specific configuration file (e.g., 'settings.json')
			 * from a given base directory Effect. It safely handles file reading and JSON parsing.
			 */
			const ResolveConfigurationFile = (
				ConfigDirectoryEffect: Effect.Effect<
					Uri,
					IntegrationPathProblem
				>,
				FileName: string,
			): Effect.Effect<
				object,
				IntegrationConfigurationProblem | IntegrationPathProblem
			> =>
				ConfigDirectoryEffect.pipe(
					Effect.flatMap((ConfigDirectory) =>
						ReadRawFile(joinPath(ConfigDirectory, FileName)).pipe(
							Effect.flatMap(ParseJSON),
							// If the file doesn't exist or is invalid, treat it as an empty object.
							Effect.catchAll(() => Effect.succeed({})),
						),
					),
				);

			/**
			 * The main composed `Effect` to resolve the final, merged configuration.
			 */
			const ResolveConfiguration = Effect.all(
				{
					User: ResolveConfigurationFile(
						ResolveFinalDefaultPath(),
						"settings.json",
					),
					WorkSpace: ResolveConfigurationFile(
						ResolveWorkSpacePath(),
						"settings.json",
					),
				},
				{ concurrency: "unbounded" },
			).pipe(
				Effect.map(({ User, WorkSpace }) => deepmerge(User, WorkSpace)),
				Effect.mapError(
					(Cause) =>
						new ApplicationConfigurationProblem({
							Cause: Cause as IntegrationConfigurationProblem,
							Context: "FailedToResolveConfiguration",
						}),
				),
			);

			const ConfigurationData = yield* ResolveConfiguration.pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => {
						console.error(
							"Failed to load configuration, using empty default.",
							error,
						);
						return {};
					}),
				),
			);

			// The concrete implementation of the IConfigurationService interface.
			const ServiceImplementation: IConfigurationService = {
				_serviceBrand: undefined,

				getValue<T>(...args: any[]): T {
					let section: string | undefined = undefined;
					let overrides: IConfigurationOverrides | undefined =
						undefined;

					if (args.length > 0) {
						if (typeof args[0] === "string") {
							section = args[0];
							if (typeof args[1] === "object") {
								overrides = args[1];
							}
						} else if (typeof args[0] === "object") {
							overrides = args[0];
						}
					}

					// We are ignoring overrides for this implementation stub
					const _ = overrides;

					if (!section) {
						return ConfigurationData as T;
					}
					return GetValueFromObject(ConfigurationData, section) as T;
				},

				updateValue: () => {
					console.warn(
						"IConfigurationService.updateValue is not implemented.",
					);
					return Promise.resolve();
				},

				inspect: <T>(
					key: string,
					overrides?: IConfigurationOverrides,
				): IConfigurationValue<T> => {
					const value = ServiceImplementation.getValue<T>(
						key,
						overrides,
					);
					return {
						value,
						defaultValue: value,
						userValue: value,
						workspaceValue: value,
						workspaceFolderValue: value,
					};
				},

				keys: () => ({
					default: [],
					user: [],
					workspace: [],
					workspaceFolder: [],
				}),

				reloadConfiguration: () => Promise.resolve(),

				onDidChangeConfiguration:
					new Emitter<IConfigurationChangeEvent>().event,
				getConfigurationData: () => null,
			};

			return ServiceImplementation;
		}),
	},
) {}
