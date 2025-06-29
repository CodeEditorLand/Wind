var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { FromAPI as StatusBarItemToDTO } from "../../TypeConverter/StatusBar.js";
import { CommandService } from "../Command/Service.js";
class StatusBarItemImplementation {
  constructor(EntryId, Extension, Host, Command, OnDidDispose, InitialId, InitialAlignment, InitialPriority) {
    this.EntryId = EntryId;
    this.Extension = Extension;
    this.Host = Host;
    this.Command = Command;
    this.OnDidDispose = OnDidDispose;
    this._id = InitialId;
    this._alignment = InitialAlignment;
    this._priority = InitialPriority;
  }
  static {
    __name(this, "StatusBarItemImplementation");
  }
  IsDisposed = false;
  IsVisible = false;
  _id;
  _name;
  _alignment;
  _priority;
  _text = "";
  _tooltip;
  _color;
  _backgroundColor;
  _command;
  _accessibilityInformation;
  tooltip2;
  // Getters
  get id() {
    return this._id;
  }
  get alignment() {
    return this._alignment;
  }
  get priority() {
    return this._priority;
  }
  get name() {
    return this._name;
  }
  get text() {
    return this._text;
  }
  get tooltip() {
    return this._tooltip;
  }
  get color() {
    return this._color;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  get command() {
    return this._command;
  }
  get accessibilityInformation() {
    return this._accessibilityInformation;
  }
  // Setters with update logic
  set name(Value) {
    if (this._name !== Value) {
      this._name = Value;
      this.Update();
    }
  }
  set text(Value) {
    if (this._text !== Value) {
      this._text = Value;
      this.Update();
    }
  }
  set tooltip(Value) {
    if (this._tooltip !== Value) {
      this._tooltip = Value;
      this.Update();
    }
  }
  set color(Value) {
    if (this._color !== Value) {
      this._color = Value;
      this.Update();
    }
  }
  set backgroundColor(Value) {
    if (this._backgroundColor !== Value) {
      this._backgroundColor = Value;
      this.Update();
    }
  }
  set command(Value) {
    if (this._command !== Value) {
      this._command = Value;
      this.Update();
    }
  }
  set accessibilityInformation(Value) {
    if (this._accessibilityInformation !== Value) {
      this._accessibilityInformation = Value;
      this.Update();
    }
  }
  show() {
    if (!this.IsVisible) {
      this.IsVisible = true;
      this.Update();
    }
  }
  hide() {
    if (this.IsVisible) {
      this.IsVisible = false;
      Effect.runFork(this.Host.DisposeStatusBarItem(this.EntryId));
    }
  }
  dispose() {
    if (!this.IsDisposed) {
      this.IsDisposed = true;
      this.hide();
      this.OnDidDispose();
    }
  }
  Update() {
    if (this.IsDisposed || !this.IsVisible) {
      return;
    }
    const CommandConverter = new CommandConverter(
      this.Command.registerCommand,
      this.Command.executeCommand,
      () => void 0
      // lookupAPICommand is stubbed
    );
    const DTO = StatusBarItemToDTO(
      this,
      this.EntryId,
      this.Extension,
      CommandConverter
    );
    Effect.runFork(this.Host.SetStatusBarItem(DTO));
  }
}
export {
  StatusBarItemImplementation
};
//# sourceMappingURL=StatusBarItem.js.map
