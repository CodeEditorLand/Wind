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
	IConfigurationService,
	IConfigurationValue,
} from "vs/platform/configuration/common/configuration.js";

import type { IntegrationConfigurationProblem } from "Source/Integration/Tauri/Configuration/Error.js";
import { ParseJson } from "Source/Integration/Tauri/File/ParseJson.js";
import { ReadRawFile } from "Source/Integration/Tauri/File/ReadRawFile.js";
import { ResolveFinalDefaultPath } from "Source/Integration/Tauri/Path/Default.js";
import type { IntegrationPathProblem } from "Source/Integration/Tauri/Path/Error.js";
import { ResolveWorkSpacePath } from "Source/Integration/Tauri/Path/WorkSpace.js";
import type { Uri } from "Source/Platform/VSCode/Type.js";
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
		effect: Effect.gen(function* (Generator) {
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
				Effect.flatMap(ConfigDirectoryEffect, (ConfigDirectory) =>
					ReadRawFile(joinPath(ConfigDirectory, FileName)).pipe(
						Effect.flatMap(ParseJson),
						// If the file doesn't exist or is invalid, treat it as an empty object.
						Effect.catchAll(() => Effect.succeed({})),
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

			const ConfigurationData = yield* Generator(ResolveConfiguration);

			// The concrete implementation of the IConfigurationService interface.
			const ServiceImplementation: IConfigurationService = {
				_serviceBrand: undefined,

				getValue<T>(section?: string, _overrides?: object): T {
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
					_overrides?: object,
				): IConfigurationValue<T> => {
					const value = ServiceImplementation.getValue(
						key,
						_overrides,
					) as T | undefined;
					return {
						key,
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

				onDidChangeConfiguration: new Emitter<any>().event,
			};

			return ServiceImplementation;
		}),
	},
) {}
