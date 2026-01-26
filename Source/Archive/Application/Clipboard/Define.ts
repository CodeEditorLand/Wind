/**
 * @module Define
 * @description
 * This module defines the service interface and live implementation for the
 * application-level clipboard service. It conforms to the `IClipboardService`
 * contract from VS Code's platform services.
 *
 * The implementation bridges the declarative Effect-TS world with the native
 * host's clipboard capabilities via the `IntegrationService`.
 */

import type { IClipboardService } from "@codeeditorland/output/vs/platform/clipboard/common/clipboardService.js";
import { Effect } from "effect";

import type { Uri } from "../../Platform/VSCode/Type.js";
import { IntegrationService } from "../Integration/Define.js";
import type { IntegrationProblem } from "../Integration/Problem.js";
import { ApplicationClipboardProblem } from "./Problem.js";

/**
 * The `Effect.Service` for the `IClipboardService`.
 *
 * This service provides an abstraction over the system clipboard, allowing the
 * application to read and write text and other resources. It uses the tag
 * "vscode/ClipboardService" for identification within the DI container,
 * maintaining compatibility with VS Code's service lookup mechanism.
 *
 * The implementation is provided directly within the service definition using
 * the `effect` constructor, which depends on the `IntegrationService` to
 * execute the underlying native host commands.
 */
export class ClipboardService extends Effect.Service<IClipboardService>()(
	"vscode/ClipboardService",
	{
		effect: Effect.gen(function* (Generator) {
			const Integration = yield* Generator(IntegrationService);

			/**
			 * A higher-order function that creates an `Effect` for a specific
			 * clipboard command. It abstracts the process of invoking the command
			 * on the native host and mapping any potential `IntegrationProblem`
			 * to an `ApplicationClipboardProblem`.
			 */
			const CreateClipboardProxy = <T, Arguments extends any[]>(
				Command: string,
			) => {
				return (
					...Arguments: Arguments
				): Effect.Effect<T, ApplicationClipboardProblem> =>
					Integration.Invoke<T>(Command, { ...Arguments }).pipe(
						Effect.mapError(
							(Cause) =>
								new ApplicationClipboardProblem({ Cause }),
						),
					);
			};

			// Create proxied effects for each clipboard operation.
			const WriteTextEffect = CreateClipboardProxy<void, [string]>(
				"Clipboard.WriteText",
			);
			const ReadTextEffect = CreateClipboardProxy<string, []>(
				"Clipboard.ReadText",
			);
			const WriteResourcesEffect = CreateClipboardProxy<void, [Uri[]]>(
				"Clipboard.WriteResources",
			);
			const ReadResourcesEffect = CreateClipboardProxy<Uri[], []>(
				"Clipboard.ReadResources",
			);
			const HasResourcesEffect = CreateClipboardProxy<boolean, []>(
				"Clipboard.HasResources",
			);
			const ReadImageEffect = CreateClipboardProxy<Uint8Array, []>(
				"Clipboard.ReadImage",
			);

			/**
			 * The concrete implementation of the `IClipboardService` interface.
			 *
			 * NOTE: Method names are camelCase to conform to the `IClipboardService`
			 * contract from VS Code, which is a required exception to the project's
			 * PascalCase convention.
			 */
			const ServiceImplementation: IClipboardService = {
				_serviceBrand: undefined,

				writeText: (Text: string): Promise<void> =>
					Effect.runPromise(WriteTextEffect(Text)),

				readText: (): Promise<string> =>
					Effect.runPromise(ReadTextEffect()),

				// VS Code's find buffer is separate, but we can reuse the main clipboard.
				readFindText: (): Promise<string> =>
					Effect.runPromise(ReadTextEffect()),

				writeFindText: (Text: string): Promise<void> =>
					Effect.runPromise(WriteTextEffect(Text)),

				writeResources: (Resources: Uri[]): Promise<void> =>
					Effect.runPromise(WriteResourcesEffect(Resources)),

				readResources: (): Promise<Uri[]> =>
					Effect.runPromise(ReadResourcesEffect()),

				hasResources: (): Promise<boolean> =>
					Effect.runPromise(HasResourcesEffect()),

				readImage: (): Promise<Uint8Array> =>
					Effect.runPromise(ReadImageEffect()),

				// This feature is not implemented in our native host.
				triggerPaste: (
					_TargetWindowID: number,
				): Promise<void> | undefined => {
					console.warn(
						"IClipboardService.triggerPaste is not implemented.",
					);
					return undefined;
				},
			};

			return ServiceImplementation;
		}),
	},
) {}
