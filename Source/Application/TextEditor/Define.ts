/**
 * @module Define
 * @description
 * Defines the service for managing text file models, conforming to the
 * `ITextFileService` from VS Code. This service is responsible for reading,
 * writing, and managing the state of text-based files.
 */

import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { IFilesConfigurationService } from "@codeeditorland/output/vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "@codeeditorland/output/vs/workbench/services/lifecycle/common/lifecycle.js";
import {
	ITextFileService,
	type ITextFileSaveOptions,
} from "@codeeditorland/output/vs/workbench/services/textfile/common/textfiles.js";
import { TextFileService as VSCodeTextFileService } from "@codeeditorland/output/vs/workbench/services/textfile/common/textFileService.js";
import { IUntitledTextEditorService } from "@codeeditorland/output/vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "@codeeditorland/output/vs/workbench/services/workingCopy/common/workingCopyFileService.js";
import { Effect } from "effect";

import type { Uri } from "../../Platform/Vscode/Type.js";
import { HostService } from "../Host/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { TextEditorProblem } from "./Problem.js";

/**
 * The `Effect.Service` for the `ITextFileService`.
 *
 * This service implementation "lifts" the original `TextFileService` class from
 * VS Code's source. The key modification is overriding the `save` method to
 * delegate the save operation to our `HostService`, which communicates with the
 * native `Mountain` backend. All other dependencies are resolved from the DI
 * container, showcasing the hybrid DI model.
 *
 * It is registered with the identifier "textFileService" for compatibility.
 */
export class TextEditorService extends Effect.Service<ITextFileService>()(
	"textFileService",
	{
		effect: Effect.gen(function* (Generator) {
			// Resolve dependencies from the Effect context.
			const InstantiationService = yield* Generator(
				IInstantiationService,
			);
			const Host = yield* Generator(HostService);
			const Logger = yield* Generator(LoggerService);
			const FileService = yield* Generator(IFileService);
			const UntitledTextEditorService = yield* Generator(
				IUntitledTextEditorService,
			);
			const LifecycleService = yield* Generator(ILifecycleService);
			const FilesConfigurationService = yield* Generator(
				IFilesConfigurationService,
			);
			const WorkingCopyFileService = yield* Generator(
				IWorkingCopyFileService,
			);
			const UriIdentityService = yield* Generator(IUriIdentityService);

			// Instantiate the real VS Code TextFileService.
			const ServiceInstance = InstantiationService.createInstance(
				VSCodeTextFileService,
				FileService,
				UntitledTextEditorService,
				LifecycleService,
				InstantiationService,
				FilesConfigurationService,
				WorkingCopyFileService,
				UriIdentityService,
				Logger,
			) as ITextFileService;

			// Override the `save` method to delegate to our host.
			ServiceInstance.save = async (
				Resource: Uri,
				Options?: ITextFileSaveOptions,
			): Promise<Uri | undefined> => {
				const TargetResource =
					"resource" in Resource ? Resource.resource : Resource;

				if (!TargetResource) {
					const ErrorMessage =
						"TextFileService.save called but no resource was found.";
					Logger.warn(`[TextFileService] ${ErrorMessage}`);
					throw new Error(ErrorMessage);
				}

				Logger.info(
					`[TextFileService] Invoking 'Host.SaveFile' for URI: ${TargetResource.toString()}`,
				);

				const SaveEffect = Host.WriteFile(
					TargetResource,
					new Uint8Array(),
					{},
				).pipe(
					Effect.mapError(
						(Cause) =>
							new TextEditorProblem({
								Cause,
								Context: "SaveFileFailed",
							}),
					),
				);

				// Bridge back to Promise-based API required by the interface.
				await Effect.runPromise(SaveEffect);
				return TargetResource;
			};

			return ServiceInstance;
		}),
	},
) {}
