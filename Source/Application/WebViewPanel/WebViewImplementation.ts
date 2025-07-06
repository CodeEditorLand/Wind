/**
 * @module WebViewImplementation
 * @description
 * This module contains the concrete implementation of the `vscode.Webview`
 * interface. An instance of this class represents a single webview's content
 * and messaging channel, proxying state changes to the `Mountain` host.
 */

import { Schemas } from "@codeeditorland/output/vs/base/common/network.js";
import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import { Effect } from "effect";
import type { Event, Uri, Webview, WebviewOptions } from "vscode";

import { CreateEmitter } from "../../Platform/Vscode/Type.js";
import type { Interface as HostService } from "../Host/Define.js";
import { ConvertContentOptionsToDTO } from "./Convert.js";

/**
 * A concrete implementation of the `vscode.Webview` interface.
 */
export class WebViewImplementation implements Webview {
	private _IsDisposed = false;
	private _html = "";
	private _options: WebviewOptions;

	private readonly _OnDidReceiveMessageEmitter: Emitter<any>;
	public readonly onDidReceiveMessage: Event<any>;

	constructor(
		public readonly Handle: string,
		private readonly Host: HostService,
		private readonly Extension: IExtensionDescription,
		InitialOptions: WebviewOptions,
	) {
		this._options = InitialOptions;
		this._OnDidReceiveMessageEmitter = CreateEmitter<any>();
		this.onDidReceiveMessage = this._OnDidReceiveMessageEmitter.event;
	}

	public get html(): string {
		return this._html;
	}
	public set html(Value: string) {
		if (this._IsDisposed || this._html === Value) {
			return;
		}
		this._html = Value;
		Effect.runFork(this.Host.SetWebviewHtml(this.Handle, Value));
	}

	public get options(): WebviewOptions {
		return this._options;
	}
	public set options(NewOptions: WebviewOptions) {
		if (this._IsDisposed) {
			return;
		}
		this._options = NewOptions;
		const OptionsDTO = ConvertContentOptionsToDTO(
			this.Extension,
			NewOptions,
		);
		Effect.runFork(
			this.Host.SetWebviewOptions(this.Handle, OptionsDTO as any),
		);
	}

	public get cspSource(): string {
		// This should be a securely generated nonce in a real implementation.
		return "vscode-resource: vscode-webview-resource: https:";
	}

	public postMessage(Message: any): Promise<boolean> {
		if (this._IsDisposed) {
			return Promise.resolve(false);
		}
		const PostEffect = this.Host.PostMessageToWebview(
			this.Handle,
			Message,
		).pipe(Effect.catchAll(() => Effect.succeed(false)));
		return Effect.runPromise(PostEffect);
	}

	public asWebviewUri(LocalResource: Uri): Uri {
		const Authority = this.Extension.id.toLowerCase();
		return LocalResource.with({
			scheme: Schemas.vscodeFileResource, // A special scheme for webview resources.
			authority: Authority,
		});
	}

	/**
	 * Fires the `onDidReceiveMessage` event. Called by the `WebViewPanelService`.
	 */
	public FireDidReceiveMessage(Message: any): void {
		if (!this._IsDisposed) {
			this._OnDidReceiveMessageEmitter.fire(Message);
		}
	}

	/**
	 * Disposes the webview's resources, primarily the event emitter.
	 */
	public dispose(): void {
		if (!this._IsDisposed) {
			this._IsDisposed = true;
			this._OnDidReceiveMessageEmitter.dispose();
		}
	}
}
