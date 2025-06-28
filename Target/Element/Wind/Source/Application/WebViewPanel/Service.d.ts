/**
 * @module Service (Application/WebViewPanel)
 * @description Defines the service for creating and managing `vscode.WebviewPanel` instances.
 */
import { Effect } from "effect";
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import { Disposable, type ViewColumn, type WebviewOptions, type WebviewPanel as VSCodeWebviewPanel, type WebviewPanelOptions, type WebviewPanelSerializer } from "vscode";
import { WebViewPanelImplementation } from "./WebViewPanelImplementation.js";
import { WebViewPanelProblem } from "./Error.js";
/**
 * The contract for the WebViewPanel service.
 */
interface WebViewPanel {
    readonly CreateWebviewPanel: (Extension: IExtensionDescription, ViewType: string, Title: string, ShowOptions: ViewColumn | {
        viewColumn: ViewColumn;
        preserveFocus?: boolean;
    }, Options?: WebviewPanelOptions & WebviewOptions) => Effect.Effect<VSCodeWebviewPanel, WebViewPanelProblem>;
    readonly RegisterWebviewPanelSerializer: (Extension: IExtensionDescription, ViewType: string, Serializer: WebviewPanelSerializer) => Effect.Effect<Disposable, WebViewPanelProblem>;
}
declare const WebViewPanelService_base: Effect.Service.Class<WebViewPanel, "Service/WebViewPanel", {
    readonly effect: Effect.Effect<{
        CreateWebviewPanel: (Extension: IExtensionDescription, ViewType: string, Title: string, ShowOptions: ViewColumn | {
            viewColumn: ViewColumn;
            preserveFocus?: boolean;
        }, Options?: WebviewPanelOptions & WebviewOptions) => Effect.Effect<WebViewPanelImplementation, WebViewPanelProblem, unknown>;
        RegisterWebviewPanelSerializer: (_Extension: IExtensionDescription, ViewType: string, _Serializer: WebviewPanelSerializer) => Effect.Effect<Disposable, WebViewPanelProblem, never>;
    }, unknown, unknown>;
}>;
/**
 * The `Effect.Service` for managing webview panels.
 */
export declare class WebViewPanelService extends WebViewPanelService_base {
}
export {};
