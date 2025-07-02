/**
 * @module Service (Application/Clipboard)
 * @description Defines the service interface and live implementation for the
 * application-level clipboard service, conforming to the `IClipboardService`
 * contract from VS Code.
 *
 * Responsibilities:
 *   - Declare the contract and provide the `Effect.Service` tag.
 *   - Implement the service by creating an Effect that bridges the declarative
 *     Effect-TS world with the imperative, promise-based VS Code API.
 */

import { Effect, Runtime } from "effect";
import type { IClipboardService } from "@codeeditorland/output/vs/platform/clipboard/common/clipboardService.js";

import type { IntegrationClipboardProblem } from "../../Integration/Tauri/Clipboard/Error.js";
import {
	HasResourceList,
	ReadImage,
	ReadResourceList,
	ReadText,
	WriteResourceList,
	WriteText,
} from "../../Integration/Tauri/Clipboard/Wrapper.js";
import type { Uri } from "../../Platform/VSCode/Type.js";
import { ApplicationClipboardProblem } from "./Error.js";

/**
 * The `Effect.Service` for the `IClipboardService`.
 *
 * This service provides an abstraction over the system clipboard, allowing the
 * application to read and write text and other resources. It uses the tag

 * "vscode/ClipboardService" for identification within the DI container, maintaining
 * compatibility with VS Code's service lookup mechanism.
 *
 * The implementation is provided directly within the service definition using
 * the `effect` constructor, which depends on the application `Runtime` to
 * execute the underlying integration-layer Effects.
 */
export class Clipboard extends Effect.Service<IClipboardService>()(
	"vscode/ClipboardService",
	{
		effect: Effect.gen(function* () {
			const AppRuntime = yield* Effect.runtime<never>();

			/**
			 * Higher-order function to execute an `Effect` from the Integration layer and
			 * return its result as a `Promise`. This is the bridge to the imperative world.
			 */
			const RunIntegrationEffect = <SuccessType>(
				IntegrationEffect: Effect.Effect<
					SuccessType,
					IntegrationClipboardProblem
				>,
			): Promise<SuccessType> => {
				const MappedEffect = IntegrationEffect.pipe(
					Effect.mapError(
						(Cause) => new ApplicationClipboardProblem({ Cause }),
					),
				);
				return Runtime.runPromise(AppRuntime, MappedEffect);
			};

			// The concrete implementation of the IClipboardService interface.
			const ServiceImplementation: IClipboardService = {
				_serviceBrand: undefined,

				writeText: (Text: string): Promise<void> =>
					RunIntegrationEffect(WriteText(Text)),

				readText: (): Promise<string> => RunIntegrationEffect(ReadText),

				readFindText: (): Promise<string> =>
					RunIntegrationEffect(ReadText),

				writeFindText: (Text: string): Promise<void> =>
					RunIntegrationEffect(WriteText(Text)),

				writeResources: (ResourceList: Uri[]): Promise<void> =>
					RunIntegrationEffect(WriteResourceList(ResourceList)),

				readResources: (): Promise<Uri[]> =>
					RunIntegrationEffect(ReadResourceList),

				hasResources: (): Promise<boolean> =>
					RunIntegrationEffect(HasResourceList),

				readImage: (): Promise<Uint8Array> =>
					RunIntegrationEffect(ReadImage),

				triggerPaste: (
					_TargetWindowId: number,
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
