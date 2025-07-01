/**
 * @module WebViewPanelImplementation (Application/WebViewPanel)
 * @description The concrete implementation of the `vscode.WebviewPanel` interface.
 * An instance of this class represents a single webview panel, proxying state
 * changes to the `Mountain` host.
 */
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import type {
	Event,
	Uri,
	ViewColumn,
	Webview,
	WebviewOptions,
	WebviewPanel,
	WebviewPanelOnDidChangeViewStateEvent,
	WebviewPanelOptions,
} from "vscode";

import type { HostService } from "../../Application/Host/Service.js";

/**
 * A concrete implementation of the `vscode.WebviewPanel` interface.
 */
export declare class WebViewPanelImplementation implements WebviewPanel {
	private readonly Handle;
	private readonly Host;
	private readonly OnDidDisposeCallback;
	private IsDisposed;
	private _title;
	private _iconPath;
	private _active;
	private _visible;
	private _viewColumn;
	private readonly OnDidDisposeEmitter;
	readonly onDidDispose: Event<void>;
	private readonly OnDidChangeViewStateEmitter;
	readonly onDidChangeViewState: Event<WebviewPanelOnDidChangeViewStateEvent>;
	readonly webview: Webview;
	readonly viewType: string;
	readonly options: WebviewPanelOptions;
	constructor(
		Handle: string,
		Host: HostService,
		Extension: IExtensionDescription,
		OnDidDisposeCallback: () => void,
		InitialViewType: string,
		InitialTitle: string,
		InitialOptions: WebviewPanelOptions & WebviewOptions,
		InitialViewColumn: ViewColumn,
	);
	get viewColumn(): ViewColumn | undefined;
	get active(): boolean;
	get visible(): boolean;
	get title(): string;
	set title(Value: string);
	get iconPath():
		| Uri
		| {
				readonly light: Uri;
				readonly dark: Uri;
		  }
		| undefined;
	set iconPath(
		Value:
			| Uri
			| {
					readonly light: Uri;
					readonly dark: Uri;
			  }
			| undefined,
	);
	reveal(ViewColumn?: ViewColumn, PreserveFocus?: boolean): void;
	dispose(): void;
	fireDidReceiveMessage(Message: any): void;
	updateViewState(NewState: {
		readonly active: boolean;
		readonly visible: boolean;
		readonly viewColumn: ViewColumn;
	}): void;
}
