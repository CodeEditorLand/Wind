/**
 * @module Service (Application/TextEditor)
 * @description Defines the service interface and `Effect.Service` tag for the
 * `ITextFileService`, which is responsible for managing text file models.
 * NOTE: The service was renamed from `ITextEditorService` to reflect the
 * VS Code service it implements (`textFileService.ts`).
 */

import { Effect } from "effect";
import { IFileService } from "vs/platform/files/common/files.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity.js";
import { TextFileService as VSCodeTextFileService } from "vs/workbench/services/textfile/common/textFileService.js";
import type { ITextFileService } from "vs/workbench/services/textfile/common/textfiles.js";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle.js";
import { IUntitledTextEditorService } from "vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService.js";

import { HostService } from "Source/Application/Host/Service.js";
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
		effect: Effect.gen(function* (Generator) {
			// Resolve dependencies from the Effect context.
			const InstantiationService = yield* Generator(
				IInstantiationService,
			);
			const Host = yield* Generator(HostService);
			const LogService = yield* Generator(ILogService);

			// Instantiate the real VS Code TextFileService.
			// Most dependencies are stubbed as they are not critical for the 'save' logic.
			const ServiceInstance = InstantiationService.createInstance(
				VSCodeTextFileService,
				{} as IFileService,
				{} as IUntitledTextEditorService,
				{} as ILifecycleService,
				InstantiationService,
				{} as IFilesConfigurationService,
				{} as IWorkingCopyFileService,
				{} as IUriIdentityService,
				LogService,
			) as ITextFileService;

			// Override the `save` method to delegate to our host.
			ServiceInstance.save = async (Resource, Options) => {
				const TargetResource =
					"resource" in Resource ? Resource.resource : Resource;

				if (!TargetResource) {
					const ErrorMessage =
						"TextFileService.save called but no resource was found.";
					LogService.warn(`[TextFileService] ${ErrorMessage}`);
					throw new Error(ErrorMessage);
				}

				LogService.info(
					`[TextFileService] Invoking 'Host.SaveFile' for URI: ${TargetResource.toString()}`,
				);

				const SaveEffect = Host.SaveFile(TargetResource, Options).pipe(
					Effect.mapError(
						(Cause) =>
							new TextEditorProblem({
								Cause,
								Context: "SaveFileFailed",
							}),
					),
				);

				// Bridge back to Promise-based API required by the interface.
				return Effect.runPromise(SaveEffect).then(() => true);
			};

			return ServiceInstance;
		}),
	},
) {}
