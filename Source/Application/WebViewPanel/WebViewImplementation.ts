/**
 * @module WebViewImplementation (Application/WebViewPanel)
 * @description The concrete implementation of the `vscode.Webview` interface.
 * An instance of this class represents a single webview from the application's
 * perspective, proxying state changes to the `Mountain` host.
 */

import { Effect } from "effect";
import { Schemas } from "vs/base/common/network.js";
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import type { Event, Uri, Webview, WebviewOptions } from "vscode";

import type { HostService } from "../../Application/Host/Service.js";
import { ConvertContentOptionsToDTO } from "../../TypeConverter/WebView.js";
import { CreateEventStream } from "../../Utility/EventStream.js";

/**
 * A concrete implementation of the `vscode.Webview` interface.
 */
export class WebViewImplementation implements Webview {
	private IsDisposed = false;
	private _html = "";
	private _options: WebviewOptions;

	private readonly OnDidReceiveMessageEmitter: Emitter<any>;
	public readonly onDidReceiveMessage: Event<any>;

	constructor(
		public readonly Handle: string,
		private readonly Host: HostService,
		private readonly Extension: IExtensionDescription,
		InitialOptions: WebviewOptions,
	) {
		this._options = InitialOptions;
		this.OnDidReceiveMessageEmitter = new Emitter<any>();
		this.onDidReceiveMessage = this.OnDidReceiveMessageEmitter.event;
	}

	public get html(): string {
		return this._html;
	}
	public set html(Value: string) {
		if (this.IsDisposed || this._html === Value) {
			return;
		}
		this._html = Value;
		Effect.runFork(this.Host.SetWebviewHtml(this.Handle, Value));
	}

	public get options(): WebviewOptions {
		return this._options;
	}
	public set options(NewOptions: WebviewOptions) {
		if (this.IsDisposed) {
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
		return "vscode-resource: vscode-webview-resource: https:";
	}

	public postMessage(Message: any): Promise<boolean> {
		if (this.IsDisposed) {
			return Promise.resolve(false);
		}
		const PostEffect = this.Host.PostMessageToWebview(
			this.Handle,
			Message,
		).pipe(Effect.catchAll(() => Effect.succeed(false)));
		return Effect.runPromise(PostEffect);
	}

	public asWebviewUri(LocalResource: Uri): Uri {
		const Authority = this.Extension.identifier.value.toLowerCase();
		return LocalResource.with({
			scheme: Schemas.vscodeFileResource,
			authority: Authority,
		});
	}

	public fireDidReceiveMessage(Message: any): void {
		if (!this.IsDisposed) {
			this.OnDidReceiveMessageEmitter.fire(Message);
		}
	}

	public dispose(): void {
		if (!this.IsDisposed) {
			this.IsDisposed = true;
			this.OnDidReceiveMessageEmitter.dispose();
		}
	}
}
