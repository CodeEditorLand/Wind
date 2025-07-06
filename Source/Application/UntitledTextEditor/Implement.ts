/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `UntitledTextEditorService`.
 */

import { IConfigurationService } from "@codeeditorland/output/vs/platform/configuration/common/configuration.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { Layer } from "effect";

import { ConfigurationService } from "../Configuration/Define.js";
import { InstantiationService } from "../Instantiation/Define.js";
import { UntitledTextEditorService } from "./Define.js";

/**
 * The live implementation `Layer` for the `UntitledTextEditorService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * which are the `IInstantiationService` and `IConfigurationService`.
 */
export const ProvideUntitledTextEditor =
	UntitledTextEditorService.Default as Layer.Layer<
		UntitledTextEditorService,
		never,
		IInstantiationService | IConfigurationService
	>;
