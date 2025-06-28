/**
 * @module WebView (TypeConverter)
 * @description Type converters for the `vscode.Webview` and `vscode.WebviewPanel` APIs.
 */

import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import type { WebviewOptions, WebviewPanelOptions, ViewColumn } from "vscode";
import { FromAPI as ViewColumnFromAPI } from "./Main/ViewColumn.js";

interface IEditorOptions {
	preserveFocus?: boolean;
}

/**
 * Converts `vscode.WebviewOptions` into a serializable DTO.
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

	const ViewColumnValue = ViewColumnFromAPI(ViewColumn);
	if (ViewColumnValue !== undefined) {
		DTO.viewColumn = ViewColumnValue;
	}

	return DTO;
};
