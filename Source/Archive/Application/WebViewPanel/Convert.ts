/**
 * @module Convert
 * @description
 * This module provides type converters for the `vscode.Webview` and
 * `vscode.WebviewPanel` APIs, serializing options into DTOs for IPC.
 */

import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import type { ViewColumn, WebviewOptions, WebviewPanelOptions } from "vscode";

import { FromAPI as ConvertViewColumn } from "../TypeConverter/Main/ViewColumn.js";

interface IEditorOptions {
	readonly preserveFocus?: boolean;
}

/**
 * Converts `vscode.WebviewOptions` into a serializable DTO for the host.
 * @param Extension The description of the extension owning the webview.
 * @param Options The webview options.
 * @returns A DTO representing the content options.
 */
export const ConvertContentOptionsToDTO = (
	Extension: IExtensionDescription,
	Options: WebviewOptions,
) => {
	return {
		enableCommandUris: Options.enableCommandUris,
		enableScripts: Options.enableScripts,
		enableForms: Options.enableForms,
		localResourceRoots: Options.localResourceRoots ?? [
			Extension.extensionLocation,
		],
		portMapping: Options.portMapping,
	};
};

/**
 * Converts `vscode.WebviewPanelOptions` into a serializable DTO.
 * @param Options The webview panel options.
 * @returns A DTO representing the panel options.
 */
export const ConvertPanelOptionsToDTO = (
	Options: WebviewPanelOptions,
): WebviewPanelOptions => {
	const DTO: {
		enableFindWidget?: boolean;
		retainContextWhenHidden?: boolean;
	} = {};
	if (Options.enableFindWidget !== undefined) {
		DTO.enableFindWidget = Options.enableFindWidget;
	}
	if (Options.retainContextWhenHidden !== undefined) {
		DTO.retainContextWhenHidden = Options.retainContextWhenHidden;
	}
	return DTO;
};

/**
 * Converts the user-provided `showOption` for a webview panel into a
 * structured DTO suitable for sending to the `Mountain` host process.
 * @param ViewColumn The target view column.
 * @param PreserveFocus Whether to preserve focus on the current element.
 * @returns A DTO representing the show options.
 */
export const ConvertShowOptionsToDTO = (
	ViewColumn: ViewColumn | undefined,
	PreserveFocus: boolean,
): { viewColumn?: number; preserveFocus: boolean } & IEditorOptions => {
	const DTO: {
		viewColumn?: number;
		preserveFocus: boolean;
	} & IEditorOptions = {
		preserveFocus: PreserveFocus,
	};

	const ViewColumnValue = ConvertViewColumn(ViewColumn);
	if (ViewColumnValue !== undefined) {
		DTO.viewColumn = ViewColumnValue;
	}

	return DTO;
};
