/**
 * @module WebView (TypeConverter)
 * @description Type converters for the `vscode.Webview` and `vscode.WebviewPanel` APIs.
 */
import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import type { ViewColumn, WebviewOptions, WebviewPanelOptions } from "vscode";
interface IEditorOptions {
    preserveFocus?: boolean;
}
/**
 * Converts `vscode.WebviewOptions` into a serializable DTO.
 */
export declare const ConvertContentOptionsToDTO: (Extension: IExtensionDescription, Options: WebviewOptions) => {
    enableCommandUris: any;
    enableScripts: any;
    enableForms: any;
    localResourceRoots: any;
    portMapping: any;
};
/**
 * Converts `vscode.WebviewPanelOptions` into a serializable DTO.
 */
export declare const ConvertPanelOptionsToDTO: (Options: WebviewPanelOptions) => WebviewPanelOptions;
/**
 * Converts the user-provided `showOption` for a webview panel into a
 * structured DTO suitable for sending to the `Mountain` host process.
 */
export declare const ConvertShowOptionsToDTO: (ViewColumn: ViewColumn | undefined, PreserveFocus: boolean) => {
    viewColumn?: number;
    preserveFocus: boolean;
} & IEditorOptions;
export {};
//# sourceMappingURL=WebView.d.ts.map