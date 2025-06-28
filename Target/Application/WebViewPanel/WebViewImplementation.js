var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { Schemas } from "vs/base/common/network.js";
import { CreateEventStream } from "Source/Utility/CreateEventStream.js";
import { ConvertContentOptionsToDTO } from "Source/TypeConverter/WebView.js";
class WebViewImplementation {
  constructor(Handle, Host, Extension, InitialOptions) {
    this.Handle = Handle;
    this.Host = Host;
    this.Extension = Extension;
    this._options = InitialOptions;
    this.onDidReceiveMessage = this.OnDidReceiveMessageEmitter.event;
  }
  static {
    __name(this, "WebViewImplementation");
  }
  IsDisposed = false;
  _html = "";
  _options;
  OnDidReceiveMessageEmitter = CreateEventStream();
  onDidReceiveMessage;
  get html() {
    return this._html;
  }
  set html(Value) {
    if (this.IsDisposed || this._html === Value) {
      return;
    }
    this._html = Value;
    Effect.runFork(this.Host.SetWebviewHtml(this.Handle, Value));
  }
  get options() {
    return this._options;
  }
  set options(NewOptions) {
    if (this.IsDisposed) {
      return;
    }
    this._options = NewOptions;
    const OptionsDTO = ConvertContentOptionsToDTO(
      this.Extension,
      NewOptions
    );
    Effect.runFork(
      this.Host.SetWebviewOptions(this.Handle, OptionsDTO)
    );
  }
  get cspSource() {
    return "vscode-resource: vscode-webview-resource: https:";
  }
  postMessage(Message) {
    if (this.IsDisposed) {
      return Promise.resolve(false);
    }
    const PostEffect = this.Host.PostMessageToWebview(
      this.Handle,
      Message
    ).pipe(Effect.catchAll(() => Effect.succeed(false)));
    return Effect.runPromise(PostEffect);
  }
  asWebviewUri(LocalResource) {
    const Authority = this.Extension.identifier.value.toLowerCase();
    return LocalResource.with({
      scheme: Schemas.vscodeFileResource,
      authority: Authority
    });
  }
  fireDidReceiveMessage(Message) {
    if (!this.IsDisposed) {
      Effect.runFork(this.OnDidReceiveMessageEmitter.Fire(Message));
    }
  }
  dispose() {
    if (!this.IsDisposed) {
      this.IsDisposed = true;
      Effect.runFork(this.OnDidReceiveMessageEmitter.Shutdown());
    }
  }
}
export {
  WebViewImplementation
};
//# sourceMappingURL=WebViewImplementation.js.map
