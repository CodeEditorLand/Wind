import { Schemas as o } from "vs/base/common/network.js";

import { Effect as t } from "../../effect";
import { ConvertContentOptionsToDTO as r } from "../../TypeConverter/WebView.js";

import "../../Utility/EventStream.js";

class h {
	constructor(e, i, p, s) {
		this.Handle = e;
		this.Host = i;
		this.Extension = p;
		((this._options = s),
			(this.OnDidReceiveMessageEmitter = new Emitter()),
			(this.onDidReceiveMessage = this.OnDidReceiveMessageEmitter.event));
	}
	IsDisposed = !1;
	_html = "";
	_options;
	OnDidReceiveMessageEmitter;
	onDidReceiveMessage;
	get html() {
		return this._html;
	}
	set html(e) {
		this.IsDisposed ||
			this._html === e ||
			((this._html = e),
			t.runFork(this.Host.SetWebviewHtml(this.Handle, e)));
	}
	get options() {
		return this._options;
	}
	set options(e) {
		if (this.IsDisposed) return;
		this._options = e;
		const i = r(this.Extension, e);
		t.runFork(this.Host.SetWebviewOptions(this.Handle, i));
	}
	get cspSource() {
		return "vscode-resource: vscode-webview-resource: https:";
	}
	postMessage(e) {
		if (this.IsDisposed) return Promise.resolve(!1);
		const i = this.Host.PostMessageToWebview(this.Handle, e).pipe(
			t.catchAll(() => t.succeed(!1)),
		);
		return t.runPromise(i);
	}
	asWebviewUri(e) {
		const i = this.Extension.identifier.value.toLowerCase();
		return e.with({ scheme: o.vscodeFileResource, authority: i });
	}
	fireDidReceiveMessage(e) {
		this.IsDisposed || this.OnDidReceiveMessageEmitter.fire(e);
	}
	dispose() {
		this.IsDisposed ||
			((this.IsDisposed = !0), this.OnDidReceiveMessageEmitter.dispose());
	}
}
export { h as WebViewImplementation };
