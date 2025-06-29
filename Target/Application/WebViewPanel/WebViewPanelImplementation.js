var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { FromAPI as UriFromAPI } from "../../TypeConverter/Main/URI.js";
import { ConvertShowOptionsToDTO } from "../../TypeConverter/WebView.js";
import { CreateEventStream } from "../../Utility/EventStream.js";
import { WebViewImplementation } from "./WebViewImplementation.js";
class WebViewPanelImplementation {
  constructor(Handle, Host, Extension, OnDidDisposeCallback, InitialViewType, InitialTitle, InitialOptions, InitialViewColumn) {
    this.Handle = Handle;
    this.Host = Host;
    this.OnDidDisposeCallback = OnDidDisposeCallback;
    this.viewType = InitialViewType;
    this.options = InitialOptions;
    this.webview = new WebViewImplementation(
      Handle,
      Host,
      Extension,
      InitialOptions
    );
    this._title = InitialTitle;
    this._viewColumn = InitialViewColumn;
    this._active = true;
    this._visible = true;
    this._iconPath = void 0;
    this.onDidDispose = this.OnDidDisposeEmitter.event;
    this.onDidChangeViewState = this.OnDidChangeViewStateEmitter.event;
  }
  static {
    __name(this, "WebViewPanelImplementation");
  }
  IsDisposed = false;
  _title;
  _iconPath;
  _active;
  _visible;
  _viewColumn;
  OnDidDisposeEmitter = CreateEventStream();
  onDidDispose;
  OnDidChangeViewStateEmitter = CreateEventStream();
  onDidChangeViewState;
  webview;
  viewType;
  options;
  get viewColumn() {
    return this._viewColumn;
  }
  get active() {
    return this._active;
  }
  get visible() {
    return this._visible;
  }
  get title() {
    return this._title;
  }
  set title(Value) {
    if (this.IsDisposed || this._title === Value) {
      return;
    }
    this._title = Value;
    Effect.runFork(this.Host.SetWebviewTitle(this.Handle, Value));
  }
  get iconPath() {
    return this._iconPath;
  }
  set iconPath(Value) {
    if (this.IsDisposed || this._iconPath === Value) {
      return;
    }
    this._iconPath = Value;
    const IconPathDTO = Value ? "light" in Value && "dark" in Value ? {
      light: UriFromAPI(Value.light),
      dark: UriFromAPI(Value.dark)
    } : {
      light: UriFromAPI(Value),
      dark: UriFromAPI(Value)
    } : void 0;
    Effect.runFork(this.Host.SetWebviewIconPath(this.Handle, IconPathDTO));
  }
  reveal(ViewColumn, PreserveFocus) {
    if (this.IsDisposed) {
      return;
    }
    const DTO = ConvertShowOptionsToDTO(ViewColumn, PreserveFocus ?? false);
    Effect.runFork(this.Host.RevealWebviewPanel(this.Handle, DTO));
  }
  dispose() {
    if (this.IsDisposed) {
      return;
    }
    this.IsDisposed = true;
    this.OnDidDisposeEmitter.Fire();
    this.OnDidDisposeCallback();
    this.webview.dispose();
    Effect.runFork(this.Host.DisposeWebview(this.Handle));
  }
  fireDidReceiveMessage(Message) {
    this.webview.fireDidReceiveMessage(Message);
  }
  updateViewState(NewState) {
    if (this.IsDisposed) {
      return;
    }
    const Changed = this._active !== NewState.active || this._visible !== NewState.visible || this._viewColumn !== NewState.viewColumn;
    this._active = NewState.active;
    this._visible = NewState.visible;
    this._viewColumn = NewState.viewColumn;
    if (Changed) {
      this.OnDidChangeViewStateEmitter.Fire({ webviewPanel: this });
    }
  }
}
export {
  WebViewPanelImplementation
};
//# sourceMappingURL=WebViewPanelImplementation.js.map
