/**
 * @module Define
 * @description
 * This module defines the service for creating and managing untitled text editor
 * models. It lifts the original `UntitledTextEditorService` from VS Code.
 */

import { IConfigurationService } from "@codeeditorland/output/vs/platform/configuration/common/configuration.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import {
	IUntitledTextEditorService,
	UntitledTextEditorService as VSCodeUntitledTextEditorService,
} from "@codeeditorland/output/vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { Effect } from "effect";

/**
 * The `Effect.Service` for the `IUntitledTextEditorService`.
 *
 * This service implementation "lifts" the original `UntitledTextEditorService`
 * class from VS Code. It is responsible for creating and managing the lifecycle
 * of untitled text models, which are in-memory documents that have not yet
 * been saved to disk.
 *
 * It is registered with the identifier "untitledTextEditorService" for compatibility.
 */
export class UntitledTextEditorService extends Effect.Service<IUntitledTextEditorService>()(
	"untitledTextEditorService",
	{
		effect: Effect.gen(function* (Generator) {
			const InstantiationService = yield* Generator(
				IInstantiationService,
			);
			const ConfigurationService = yield* Generator(
				IConfigurationService,
			);

			const ServiceInstance = new VSCodeUntitledTextEditorService(
				InstantiationService,
				ConfigurationService,
			);

			return ServiceInstance;
		}),
	},
) {}
