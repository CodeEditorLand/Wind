/**
 * @module Provider (TypeConverter/SourceControlManagement)
 * @description Implements the type converter for SCM Provider DTOs.
 */

import { Emitter } from "@codeeditorland/output/vs/base/common/event";
import {
	observableValue,
	type IObservable,
} from "@codeeditorland/output/vs/base/common/observable";
import { URI } from "@codeeditorland/output/vs/base/common/uri.js";
import type { ITextModel } from "@codeeditorland/output/vs/editor/common/model";
import type {
	ISCMProvider,
	ISCMRepository,
} from "@codeeditorland/output/vs/workbench/contrib/scm/common/scm.js";
import type {
	Command,
	ISCMActionButtonDescriptor,
	ISCMHistoryProvider,
} from "vscode";

/**
 * The Data Transfer Object for an SCM Provider.
 * This should be kept in sync with the DTO from Mountain.
 */
export interface SourceControlManagementProviderDTO {
	readonly Handle: number;
	readonly Label: string;
	readonly RootUri?: string;
}

/**
 * Converts a provider DTO from the host into the `ISCMProvider` interface
 * expected by the workbench.
 *
 * @param DTO - The SCM Provider DTO received from the host.
 * @returns An object conforming to the `ISCMProvider` interface.
 */
export const FromDTO = (
	DTO: SourceControlManagementProviderDTO,
): ISCMProvider => ({
	id: String(DTO.Handle),
	label: DTO.Label,
	rootUri: DTO.RootUri ? URI.parse(DTO.RootUri) : undefined,
	contextValue: "",
	name: DTO.Label,
	groups: [],
	historyProvider: observableValue(
		"historyProvider",
		undefined as ISCMHistoryProvider | undefined,
	),
	acceptInputCommand: undefined,
	actionButton: observableValue(
		"actionButton",
		undefined as ISCMActionButtonDescriptor | undefined,
	),
	count: observableValue("count", undefined as number | undefined),
	commitTemplate: observableValue("commitTemplate", ""),
	statusBarCommands: observableValue(
		"statusBarCommands",
		undefined as Command[] | undefined,
	),
	onDidChangeResources: new Emitter().event,
	onDidChangeResourceGroups: new Emitter().event,
	inputBoxTextModel: {} as ITextModel,
	getOriginalResource: () => Promise.resolve(null),
	dispose: () => {},
});
