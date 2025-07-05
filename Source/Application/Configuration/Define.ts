/**
 * @module Define
 * @description
 * Defines the service interface and live implementation for the application-level
 * configuration service, which conforms to the `IConfigurationService` contract
 * from VS Code. It is responsible for reading, merging, and providing access to
 * user and workspace settings.
 */

import { Emitter } from "@codeeditorland/output/vs/base/common/event.js";
import type {
	IConfigurationChangeEvent,
	IConfigurationData,
	IConfigurationOverrides,
	IConfigurationService,
	IConfigurationValue,
} from "@codeeditorland/output/vs/platform/configuration/common/configuration.js";
import { deepmerge } from "deepmerge-ts";
import { Effect } from "effect";

import type { Uri } from "../../Platform/Vscode/Type.js";
import { IntegrationService } from "../Integration/Define.js";
import type { IntegrationProblem } from "../Integration/Problem.js";
import { ApplicationConfigurationProblem } from "./Problem.js";

/**
 * A robust helper function to retrieve a nested property from a configuration
 * object using a dot-separated key string.
 *
 * @param ConfigurationObject The root configuration object.
 * @param Key The dot-separated key (e.g., 'workbench.editor.fontSize').
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
 *
 * It is registered with the identifier "configurationService" for compatibility
 * with legacy VS Code service lookups.
 */
export class ConfigurationService extends Effect.Service<IConfigurationService>()(
	"configurationService",
	{
		effect: Effect.gen(function* (Generator) {
			const Integration = yield* Generator(IntegrationService);

			/**
			 * An `Effect` that resolves a specific configuration file (e.g., 'settings.json')
			 * from a given base directory Effect. It safely handles file reading and JSON parsing.
			 * If the file doesn't exist or is invalid, it returns an empty object.
			 */
			const ResolveConfigurationFile = (
				PathResolverEffect: Effect.Effect<Uri, IntegrationProblem>,
				FileName: string,
			): Effect.Effect<object, IntegrationProblem> =>
				PathResolverEffect.pipe(
					Effect.flatMap((ConfigDirectory) =>
						Integration.ReadFile(
							ConfigDirectory.with({
								path: `${ConfigDirectory.path}/${FileName}`,
							}),
						).pipe(
							Effect.flatMap((Buffer) =>
								Effect.try({
									try: () =>
										JSON.parse(
											new TextDecoder().decode(Buffer),
										),
									catch: () =>
										new ApplicationConfigurationProblem({
											Cause: new Error(
												"JSON Parse Failed",
											) as any,
											Context:
												"ParseConfigurationFileFailed",
										}),
								}),
							),
							Effect.catchAll(() => Effect.succeed({})),
						),
					),
				);

			/**
			 * The main composed `Effect` to resolve the final, merged configuration.
			 * It fetches user and workspace settings concurrently and merges them.
			 */
			const ResolveConfiguration = Effect.all(
				{
					User: ResolveConfigurationFile(
						Integration.Invoke("Path.Resolve", {
							Name: "UserConfig",
						}),
						"settings.json",
					),
					WorkSpace: ResolveConfigurationFile(
						Integration.Invoke("Path.Resolve", {
							Name: "Workspace",
						}),
						"settings.json",
					),
				},
				{ concurrency: "unbounded" },
			).pipe(
				Effect.map(({ User, WorkSpace }) => deepmerge(User, WorkSpace)),
				Effect.mapError(
					(Cause) =>
						new ApplicationConfigurationProblem({
							Cause: Cause as IntegrationProblem,
							Context: "FailedToResolveConfiguration",
						}),
				),
			);

			// Execute the configuration loading process. If it fails, log the error
			// and fall back to an empty configuration to prevent application crash.
			const ConfigurationData = yield* Generator(
				ResolveConfiguration.pipe(
					Effect.catchAll((error) => {
						console.error(
							"Failed to load configuration, using empty default.",
							error,
						);
						return Effect.succeed({});
					}),
				),
			);

			// The concrete implementation of the IConfigurationService interface.
			// NOTE: Method names are camelCase to conform to the `IConfigurationService`
			// contract from VS Code.
			const ServiceImplementation: IConfigurationService = {
				_serviceBrand: undefined,

				getValue<T>(...args: any[]): T {
					let section: string | undefined;
					if (typeof args[0] === "string") {
						section = args[0];
					}

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
					_overrides?: IConfigurationOverrides,
				): IConfigurationValue<T> => {
					const value = ServiceImplementation.getValue<T | undefined>(
						key,
					);
					// This is a simplified implementation. A full implementation would
					// need to inspect each configuration source separately.
					return {
						value: value,
						defaultValue: value,
						userValue: value,
						userLocalValue: value,
						userRemoteValue: value,
						workspaceValue: value,
						workspaceFolderValue: value,
						memoryValue: value,
						policyValue: value,
					};
				},

				keys: () => ({
					default: [],
					user: [],
					workspace: [],
					workspaceFolder: [],
					memory: [],
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
