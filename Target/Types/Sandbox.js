var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// Source/Types/Sandbox.ts
var SandboxNotReadyError = class extends Error {
  static {
    __name(this, "SandboxNotReadyError");
  }
  _tag = "SandboxNotReadyError";
  constructor() {
    super("window.vscode is not initialized. Preload script not executed.");
  }
};
var IPCChannelError = class extends Error {
  constructor(channel, cause) {
    super(`IPC channel '${channel}' error: ${String(cause)}`);
    this.channel = channel;
    this.cause = cause;
  }
  static {
    __name(this, "IPCChannelError");
  }
  _tag = "IPCChannelError";
};
var ConfigurationNotReadyError = class extends Error {
  static {
    __name(this, "ConfigurationNotReadyError");
  }
  _tag = "ConfigurationNotReadyError";
  constructor() {
    super("Configuration not yet resolved from preload");
  }
};
export {
  ConfigurationNotReadyError,
  IPCChannelError,
  SandboxNotReadyError
};
//# sourceMappingURL=Sandbox.js.map
