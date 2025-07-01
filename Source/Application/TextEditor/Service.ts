/**
 * @module Service (Application/TextEditor)
 * @description Defines the service interface and `Effect.Service` tag for the
 * `ITextFileService`, which is responsible for managing text file models.
 * NOTE: The service was renamed from `ITextEditorService` to reflect the
 * VS Code service it implements (`textFileService.ts`).
 */

import { Effect } from "effect";
import { IFileService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/files/common/files.js";
import { IInstantiationService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/log/common/log.js";
import { IUriIdentityService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/uriIdentity/common/uriIdentity.js";
import { IFilesConfigurationService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/lifecycle/common/lifecycle.js";
import {
	ITextFileService,
	type ITextFileSaveOptions,
} from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/textfile/common/textfiles.js";
import { TextFileService as VSCodeTextFileService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/textfile/common/textFileService.js";
import { IUntitledTextEditorService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/workingCopy/common/workingCopyFileService.js";

import { type Uri } from "../../Platform/VSCode/Type.js";
import { HostService } from "../Host/Service.js";
import { TextEditorProblem } from "./Error.js";

/**
 * The `Effect.Service` for the `ITextFileService`.
 *
 * This service implementation "lifts" the original `TextFileService` class from
 * VS Code's source. The key modification is overriding the `save` method to
 * delegate the save operation to our `HostService`, which communicates with the
 * native `Mountain` backend. All other dependencies are resolved from the DI
 * container, showcasing the hybrid DI model.
 */
export class TextEditorService extends Effect.Service<ITextFileService>()(
	"textFileService",
	{
		effect: Effect.gen(function* () {
			// Resolve dependencies from the Effect context.
			const InstantiationService = yield* IInstantiationService;
			const Host = yield* HostService;
			const LoggerService = yield* ILogService;
			const FileService = yield* IFileService;
			const UntitledTextEditorService = yield* IUntitledTextEditorService;
			const LifecycleService = yield* ILifecycleService;
			const FilesConfigurationService = yield* IFilesConfigurationService;
			const WorkingCopyFileService = yield* IWorkingCopyFileService;
			const UriIdentityService = yield* IUriIdentityService;

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
				LoggerService,
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
					LoggerService.warn(`[TextFileService] ${ErrorMessage}`);
					throw new Error(ErrorMessage);
				}

				LoggerService.info(
					`[TextFileService] Invoking 'Host.SaveFile' for URI: ${TargetResource.toString()}`,
				);

				const SaveEffect = Effect.promise(() =>
					Host.SaveFile(TargetResource, Options),
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
