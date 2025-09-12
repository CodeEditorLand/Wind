/**
 * @module WebViewPanelImplementation
 * @description
 * This module contains the concrete implementation of the `vscode.WebviewPanel`
 * interface. An instance of this class represents a single webview panel,
 * proxying state changes to the `Mountain` host and managing its lifecycle.
 */

import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import { Effect } from "effect";
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

import { CreateEmitter } from "../../Platform/Vscode/Type.js";
import type { Interface as HostService } from "../Host/Define.js";
import { FromAPI as ConvertUriToDTO } from "../TypeConverter/Main/Uri.js";
import { ConvertShowOptionsToDTO } from "./Convert.js";
import { WebViewImplementation } from "./WebViewImplementation.js";

/**
 * A concrete implementation of the `vscode.WebviewPanel` interface.
 */
export class WebViewPanelImplementation implements WebviewPanel {
	private _IsDisposed = false;
	private _title: string;
	private _iconPath:
		| Uri
		| { readonly light: Uri; readonly dark: Uri }
		| undefined;
	private _active: boolean;
	private _visible: boolean;
	private _viewColumn: ViewColumn;

	private readonly _OnDidDisposeEmitter = CreateEmitter<void>();
	public readonly onDidDispose: Event<void>;

	private readonly _OnDidChangeViewStateEmitter =
		CreateEmitter<WebviewPanelOnDidChangeViewStateEvent>();
	public readonly onDidChangeViewState: Event<WebviewPanelOnDidChangeViewStateEvent>;

	public readonly webview: Webview;
	public readonly viewType: string;
	public readonly options: WebviewPanelOptions;

	constructor(
		private readonly Handle: string,
		private readonly Host: HostService,
		Extension: IExtensionDescription,
		private readonly OnDidDisposeCallback: () => void,
		InitialViewType: string,
		InitialTitle: string,
		InitialOptions: WebviewPanelOptions & WebviewOptions,
		InitialViewColumn: ViewColumn,
	) {
		this.viewType = InitialViewType;
		this.options = InitialOptions;
		this.webview = new WebViewImplementation(
			Handle,
			Host,
			Extension,
			InitialOptions,
		);
		this._title = InitialTitle;
		this._viewColumn = InitialViewColumn;
		this._active = true; // A new panel is always active initially.
		this._visible = true; // A new panel is always visible initially.
		this._iconPath = undefined;
		this.onDidDispose = this._OnDidDisposeEmitter.event;
		this.onDidChangeViewState = this._OnDidChangeViewStateEmitter.event;
	}

	public get viewColumn(): ViewColumn {
		return this._viewColumn;
	}
	public get active(): boolean {
		return this._active;
	}
	public get visible(): boolean {
		return this._visible;
	}
	public get title(): string {
		return this._title;
	}
	public set title(Value: string) {
		if (this._IsDisposed || this._title === Value) {
			return;
		}
		this._title = Value;
		Effect.runFork(this.Host.SetWebviewTitle(this.Handle, Value));
	}

	public get iconPath():
		| Uri
		| { readonly light: Uri; readonly dark: Uri }
		| undefined {
		return this._iconPath;
	}
	public set iconPath(
		Value: Uri | { readonly light: Uri; readonly dark: Uri } | undefined,
	) {
		if (this._IsDisposed || this._iconPath === Value) {
			return;
		}
		this._iconPath = Value;
		const IconPathDTO = Value
			? "light" in Value && "dark" in Value
				? {
						light: ConvertUriToDTO(Value.light),
						dark: ConvertUriToDTO(Value.dark),
					}
				: {
						light: ConvertUriToDTO(Value as Uri),
						dark: ConvertUriToDTO(Value as Uri),
					}
			: undefined;
		Effect.runFork(this.Host.SetWebviewIconPath(this.Handle, IconPathDTO));
	}

	public reveal(ViewColumn?: ViewColumn, PreserveFocus?: boolean): void {
		if (this._IsDisposed) {
			return;
		}
		const DTO = ConvertShowOptionsToDTO(ViewColumn, PreserveFocus ?? false);
		Effect.runFork(this.Host.RevealWebviewPanel(this.Handle, DTO));
	}

	public dispose(): void {
		if (this._IsDisposed) {
			return;
		}
		this._IsDisposed = true;
		this._OnDidDisposeEmitter.fire();
		this._OnDidDisposeEmitter.dispose();
		this._OnDidChangeViewStateEmitter.dispose();
		this.OnDidDisposeCallback();
		(this.webview as WebViewImplementation).dispose();
		Effect.runFork(this.Host.DisposeWebview(this.Handle));
	}

	public FireDidReceiveMessage(Message: any): void {
		(this.webview as WebViewImplementation).FireDidReceiveMessage(Message);
	}

	public UpdateViewState(NewState: {
		readonly active: boolean;
		readonly visible: boolean;
		readonly viewColumn: ViewColumn;
	}): void {
		if (this._IsDisposed) {
			return;
		}
		const Changed =
			this._active !== NewState.active ||
			this._visible !== NewState.visible ||
			this._viewColumn !== NewState.viewColumn;

		this._active = NewState.active;
		this._visible = NewState.visible;
		this._viewColumn = NewState.viewColumn;

		if (Changed) {
			this._OnDidChangeViewStateEmitter.fire({ webviewPanel: this });
		}
	}
}
