var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function invokeTauri(command, args = {}) {
  try {
    const tauri = window.__TAURI__ ?? window.TAURI;
    if (typeof tauri?.invoke === "function") {
      return await tauri.invoke(command, args);
    }
    throw new Error(`Tauri invoke not available for command: ${command}`);
  } catch (error) {
    console.error(
      `[IPCRendererShim] Tauri invoke failed for ${command}:`,
      error
    );
    throw error;
  }
}
__name(invokeTauri, "invokeTauri");
function sendTauri(command, args = {}) {
  try {
    const tauri = window.__TAURI__ ?? window.TAURI;
    if (typeof tauri?.invoke === "function") {
      tauri.invoke(command, args).catch((error) => {
        console.warn(
          `[IPCRendererShim] Tauri send failed (no response expected): ${command}`,
          error
        );
      });
    } else {
      console.warn(
        `[IPCRendererShim] Tauri not available for: ${command}`
      );
    }
  } catch (error) {
    console.warn(
      `[IPCRendererShim] Tauri send error (no response expected): ${command}`,
      error
    );
  }
}
__name(sendTauri, "sendTauri");
const IPC_CHANNEL_MAPPINGS = [
  // Logger service
  {
    electronPattern: /^logger:(log|warn|error|info|debug|trace|critical)$/,
    tauriCommand: "logger:log",
    transform: /* @__PURE__ */ __name((_args) => ({
      level: _args[0],
      message: _args[1],
      context: _args[2]
    }), "transform")
  },
  // Policy service
  {
    electronPattern: /^policy:(get|set|validate|enforce|check)$/,
    tauriCommand: "policy:handle",
    transform: /* @__PURE__ */ __name((_args) => ({
      action: _args[0],
      data: _args[1]
    }), "transform")
  },
  // Signing service
  {
    electronPattern: /^sign:(sign|verify|generate|validate)$/,
    tauriCommand: "sign:handle",
    transform: /* @__PURE__ */ __name((_args) => ({
      action: _args[0],
      data: _args[1],
      options: _args[2]
    }), "transform")
  },
  // User data profiles service
  {
    electronPattern: /^userDataProfiles:(create|delete|update|get|list)$/,
    tauriCommand: "user_data:handle_profile",
    transform: /* @__PURE__ */ __name((_args) => ({
      action: _args[0],
      profileId: _args[1],
      data: _args[2]
    }), "transform")
  },
  // Local file system service
  {
    electronPattern: /^localFileSystem:(read|write|delete|exists|stat|readdir)$/,
    tauriCommand: "file:handle",
    transform: /* @__PURE__ */ __name((_args) => ({
      action: _args[0],
      path: _args[1],
      data: _args[2]
    }), "transform")
  }
];
function mapElectronChannelToTauri(channel) {
  for (const mapping of IPC_CHANNEL_MAPPINGS) {
    if (mapping.electronPattern.test(channel)) {
      const args = mapping.transform?.([]) ?? {};
      return { command: mapping.tauriCommand, args };
    }
  }
  return null;
}
__name(mapElectronChannelToTauri, "mapElectronChannelToTauri");
function transformChannelArgs(channel, args) {
  for (const mapping of IPC_CHANNEL_MAPPINGS) {
    if (mapping.electronPattern.test(channel) && mapping.transform) {
      return mapping.transform(args);
    }
  }
  return { args };
}
__name(transformChannelArgs, "transformChannelArgs");
function SerializeIPC(Data) {
  const Parts = [];
  function Write(Value) {
    if (Value === void 0 || Value === null) {
      Parts.push(new Uint8Array([0]));
    } else if (typeof Value === "string") {
      const Encoded = new TextEncoder().encode(Value);
      Parts.push(new Uint8Array([1]));
      WriteVQL(Encoded.length);
      Parts.push(Encoded);
    } else if (Array.isArray(Value)) {
      Parts.push(new Uint8Array([4]));
      WriteVQL(Value.length);
      for (const Item of Value) Write(Item);
    } else if (typeof Value === "number" && (Value | 0) === Value) {
      Parts.push(new Uint8Array([6]));
      WriteVQL(Value);
    } else {
      const Encoded = new TextEncoder().encode(JSON.stringify(Value));
      Parts.push(new Uint8Array([5]));
      WriteVQL(Encoded.length);
      Parts.push(Encoded);
    }
  }
  __name(Write, "Write");
  function WriteVQL(Value) {
    const Bytes = [];
    let V = Value >>> 0;
    while (V > 127) {
      Bytes.push(V & 127 | 128);
      V >>>= 7;
    }
    Bytes.push(V & 127);
    Parts.push(new Uint8Array(Bytes));
  }
  __name(WriteVQL, "WriteVQL");
  Write(Data);
  let Total = 0;
  for (const P of Parts) Total += P.length;
  const Result = new Uint8Array(Total);
  let Offset = 0;
  for (const P of Parts) {
    Result.set(P, Offset);
    Offset += P.length;
  }
  return Result;
}
__name(SerializeIPC, "SerializeIPC");
function DeserializeIPC(Buffer2) {
  const View = new Uint8Array(Buffer2);
  let Pos = 0;
  function ReadVQL() {
    let Value = 0;
    for (let N = 0; ; N += 7) {
      const Byte = View[Pos++];
      Value |= (Byte & 127) << N;
      if (!(Byte & 128)) return Value;
    }
  }
  __name(ReadVQL, "ReadVQL");
  function Read() {
    const Type = View[Pos++];
    switch (Type) {
      case 0:
        return void 0;
      case 1: {
        const Len = ReadVQL();
        const Str = new TextDecoder().decode(
          View.slice(Pos, Pos + Len)
        );
        Pos += Len;
        return Str;
      }
      case 2:
      case 3: {
        const Len = ReadVQL();
        const Buf = View.slice(Pos, Pos + Len);
        Pos += Len;
        return Buf;
      }
      case 4: {
        const Len = ReadVQL();
        const Arr = [];
        for (let I = 0; I < Len; I++) Arr.push(Read());
        return Arr;
      }
      case 5: {
        const Len = ReadVQL();
        const Str = new TextDecoder().decode(
          View.slice(Pos, Pos + Len)
        );
        Pos += Len;
        return JSON.parse(Str);
      }
      case 6:
        return ReadVQL();
    }
  }
  __name(Read, "Read");
  return Read();
}
__name(DeserializeIPC, "DeserializeIPC");
function BuildIPCMessage(Header, Body) {
  const H = SerializeIPC(Header);
  const B = SerializeIPC(Body);
  const Result = new Uint8Array(H.length + B.length);
  Result.set(H, 0);
  Result.set(B, H.length);
  return Result;
}
__name(BuildIPCMessage, "BuildIPCMessage");
function ParseIPCMessage(Buffer2) {
  const View = new Uint8Array(Buffer2);
  let Pos = 0;
  function ReadVQL() {
    let Value = 0;
    for (let N = 0; ; N += 7) {
      const Byte = View[Pos++];
      Value |= (Byte & 127) << N;
      if (!(Byte & 128)) return Value;
    }
  }
  __name(ReadVQL, "ReadVQL");
  function Read() {
    const Type = View[Pos++];
    switch (Type) {
      case 0:
        return void 0;
      case 1: {
        const Len = ReadVQL();
        const Str = new TextDecoder().decode(
          View.slice(Pos, Pos + Len)
        );
        Pos += Len;
        return Str;
      }
      case 2:
      case 3: {
        const Len = ReadVQL();
        Pos += Len;
        return View.slice(Pos - Len, Pos);
      }
      case 4: {
        const Len = ReadVQL();
        const Arr = [];
        for (let I = 0; I < Len; I++) Arr.push(Read());
        return Arr;
      }
      case 5: {
        const Len = ReadVQL();
        const Str = new TextDecoder().decode(
          View.slice(Pos, Pos + Len)
        );
        Pos += Len;
        return JSON.parse(Str);
      }
      case 6:
        return ReadVQL();
    }
  }
  __name(Read, "Read");
  const Header = Read();
  const Body = Read();
  return { Header, Body };
}
__name(ParseIPCMessage, "ParseIPCMessage");
class IPCRendererImpl {
  static {
    __name(this, "IPCRendererImpl");
  }
  // Track event listeners by channel
  listeners = /* @__PURE__ */ new Map();
  // Track reply handlers
  replyHandlers = /* @__PURE__ */ new Map();
  replyCounter = 0;
  // Track once listeners
  onceListeners = /* @__PURE__ */ new Map();
  /**
   * Emit a vscode:message event to registered listeners (loopback)
   */
  emitMessage(Data) {
    const Event = {
      sender: {},
      senderId: 0,
      senderIsMainFrame: true,
      ports: []
    };
    const Listeners = this.listeners.get("vscode:message");
    if (Listeners) {
      for (const Listener of Listeners) {
        try {
          Listener(Event, Data);
        } catch (Error2) {
          console.error(
            "[IPCRendererShim] Error in vscode:message listener:",
            Error2
          );
        }
      }
    }
  }
  /**
   * Handle the VS Code binary IPC protocol (loopback responder).
   * Parses incoming binary requests and sends back stub responses.
   */
  handleBinaryIPC(Buffer2) {
    try {
      const { Header, Body } = ParseIPCMessage(Buffer2);
      const HeaderArr = Header;
      if (!Array.isArray(HeaderArr)) return;
      const Type = HeaderArr[0];
      if (Type === 100) {
        const RequestId = HeaderArr[1];
        const ChannelName = HeaderArr[2];
        const MethodName = HeaderArr[3];
        console.log(
          `[IPCRendererShim] IPC request: ${ChannelName}.${MethodName} (id=${RequestId})`
        );
        const StubResponse = this.getStubResponse(
          ChannelName,
          MethodName,
          Body
        );
        if (typeof StubResponse === "string" && StubResponse.startsWith("__IPC_ERROR__")) {
          const ErrorMessage = StubResponse.slice(13);
          const Response = BuildIPCMessage(
            [202, RequestId],
            ErrorMessage
          );
          setTimeout(() => this.emitMessage(Response), 0);
        } else {
          const Response = BuildIPCMessage(
            [201, RequestId],
            StubResponse
          );
          setTimeout(() => this.emitMessage(Response), 0);
        }
      } else if (Type === 102) {
        const RequestId = HeaderArr[1];
        const ChannelName = HeaderArr[2];
        const EventName = HeaderArr[3];
        console.log(
          `[IPCRendererShim] IPC event subscribe: ${ChannelName}.${EventName} (id=${RequestId})`
        );
      }
    } catch (Error2) {
      console.warn(
        "[IPCRendererShim] Failed to parse IPC message:",
        Error2
      );
    }
  }
  /**
   * Get a stub response for a channel method call.
   * These stubs allow the workbench to initialize without a real main process.
   */
  getStubResponse(Channel, Method, _Args) {
    switch (Channel) {
      case "logger":
        return void 0;
      case "policy":
        if (Method === "serialize") return {};
        return void 0;
      case "sign":
        return "";
      case "userDataProfiles":
        return void 0;
      case "keyboardLayout":
        if (Method === "getKeyboardLayoutData") {
          return {
            keyboardLayoutInfo: {
              model: "pc105",
              layout: "us",
              variant: "",
              options: "",
              rules: ""
            },
            keyboardMapping: {}
          };
        }
        return void 0;
      case "storage":
        if (Method === "getItems") return [];
        if (Method === "updateItems") return void 0;
        if (Method === "optimize") return void 0;
        if (Method === "close") return void 0;
        return void 0;
      case "configuration":
        if (Method === "getValue") return {};
        if (Method === "updateValue") return void 0;
        return void 0;
      case "sharedProcess":
        return void 0;
      case "localFilesystem":
      case "localFileSystem":
        return "__IPC_ERROR__FileNotFound";
      default:
        console.log(
          `[IPCRendererShim] Stub response for unknown channel: ${Channel}.${Method}`
        );
        return void 0;
    }
  }
  /**
   * Send message to main process
   */
  send(channel, ...args) {
    console.log(`[IPCRendererShim] send: ${channel}`, args);
    if (channel === "vscode:hello") {
      console.log(
        "[IPCRendererShim] vscode:hello received, sending Initialize response"
      );
      setTimeout(() => {
        const InitMessage = BuildIPCMessage([200], void 0);
        this.emitMessage(InitMessage);
      }, 0);
      return;
    }
    if (channel === "vscode:message") {
      const Buffer2 = args[0];
      if (Buffer2 instanceof ArrayBuffer || ArrayBuffer.isView(Buffer2)) {
        const AB = Buffer2 instanceof ArrayBuffer ? Buffer2 : Buffer2.buffer;
        this.handleBinaryIPC(AB);
      }
      return;
    }
    const mapping = mapElectronChannelToTauri(channel);
    if (mapping) {
      const tauriArgs = transformChannelArgs(channel, args);
      sendTauri(mapping.command, tauriArgs);
    } else {
      sendTauri("ipc:send", {
        channel,
        args
      });
    }
  }
  /**
   * Synchronous send - polyfilled as async with warning
   */
  sendSync(_channel, ..._args) {
    console.warn(
      `[IPCRendererShim]\u2001\u26A0\uFE0F sendSync is not supported in Tauri. Use invoke() instead. Returning undefined.`
    );
    return void 0;
  }
  /**
   * Invoke main process and get response
   */
  async invoke(channel, ...args) {
    console.log(`[IPCRendererShim] invoke: ${channel}`, args);
    const mapping = mapElectronChannelToTauri(channel);
    if (mapping) {
      const tauriArgs = transformChannelArgs(channel, args);
      return await invokeTauri(mapping.command, tauriArgs);
    }
    return await invokeTauri("ipc:invoke", {
      channel,
      args
    });
  }
  /**
   * Register event listener
   */
  on(channel, listener) {
    console.log(`[IPCRendererShim] on: ${channel}`);
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, /* @__PURE__ */ new Set());
    }
    this.listeners.get(channel).add(listener);
    this.registerTauriListener(channel, listener);
    return this;
  }
  /**
   * Register one-time event listener
   */
  once(channel, listener) {
    console.log(`[IPCRendererShim] once: ${channel}`);
    if (!this.onceListeners.has(channel)) {
      this.onceListeners.set(channel, /* @__PURE__ */ new Set());
    }
    this.onceListeners.get(channel).add(new WeakRef(listener));
    const wrappedListener = /* @__PURE__ */ __name((_event, ...args) => {
      listener(_event, ...args);
      this.removeListener(channel, wrappedListener);
    }, "wrappedListener");
    this.on(channel, wrappedListener);
    return this;
  }
  /**
   * Remove specific listener
   */
  removeListener(channel, listener) {
    console.log(`[IPCRendererShim] removeListener: ${channel}`);
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.delete(listener);
      if (channelListeners.size === 0) {
        this.listeners.delete(channel);
      }
    }
    return this;
  }
  /**
   * Remove all listeners for a channel
   */
  removeAllListeners(channel) {
    console.log(
      `[IPCRendererShim] removeAllListeners: ${channel ?? "all"}`
    );
    if (channel) {
      this.listeners.delete(channel);
    } else {
      this.listeners.clear();
    }
    return this;
  }
  /**
   * Client-side request-reply pattern (sendTo + onReply)
   */
  sendTo(channel, args, callback) {
    console.log(`[IPCRendererShim] sendTo: ${channel}`);
    const requestId = ++this.replyCounter;
    const request = {
      channel,
      args,
      callback,
      timestamp: Date.now()
    };
    this.replyHandlers.set(requestId, request);
    this.invoke(channel, ...args).then((response) => {
      const handler = this.replyHandlers.get(requestId);
      if (handler) {
        handler.callback(response);
        this.replyHandlers.delete(requestId);
      }
    }).catch((error) => {
      console.error(
        `[IPCRendererShim] sendTo error: ${channel}`,
        error
      );
      const handler = this.replyHandlers.get(requestId);
      if (handler) {
        handler.callback({ error: error.message });
        this.replyHandlers.delete(requestId);
      }
    });
  }
  /**
   * Register reply handler for sendTo pattern
   */
  onReply(channel, handler) {
    console.log(`[IPCRendererShim] onReply: ${channel}`);
    this.on(channel, (_event, ...args) => {
      handler(args[0]);
    });
  }
  /**
   * Helper method to register listener with Tauri
   */
  registerTauriListener(_channel, _listener) {
    console.log(
      `[IPCRendererShim] Registering Tauri listener for: ${_channel}`
    );
  }
  /**
   * Cleanup method to remove all listeners
   */
  cleanup() {
    console.log("[IPCRendererShim] Cleaning up IPC listeners");
    this.listeners.clear();
    this.onceListeners.clear();
    this.replyHandlers.clear();
  }
}
let ipcRendererInstance = null;
function getIPCRenderer() {
  if (!ipcRendererInstance) {
    ipcRendererInstance = new IPCRendererImpl();
    console.log("[IPCRendererShim] IPCRenderer instance created");
  }
  return ipcRendererInstance;
}
__name(getIPCRenderer, "getIPCRenderer");
function installIPCRendererShim() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__IPC_RENDERER_SHIM_INSTALLED__) {
    console.log("[IPCRendererShim] Already installed, skipping");
    return;
  }
  window.__IPC_RENDERER_SHIM_INSTALLED__ = true;
  console.log(
    "[IPCRendererShim] Installing Electron IPC renderer polyfill..."
  );
  const ipcRenderer = getIPCRenderer();
  if (typeof window.vscode !== "undefined") {
    window.vscode.ipcRenderer = ipcRenderer;
    console.log(
      "[IPCRendererShim]\u2001\u2713 IPCRenderer attached to window.vscode"
    );
  }
  window.__IPC_RENDERER__ = ipcRenderer;
  console.log("[IPCRendererShim]\u2001\u2713 Electron IPC renderer polyfill installed");
}
__name(installIPCRendererShim, "installIPCRendererShim");
var IPCRendererShim_default = {
  install: installIPCRendererShim,
  get: getIPCRenderer
};
if (typeof window !== "undefined") {
  installIPCRendererShim();
}
export {
  IPCRendererImpl as IPCRendererClass,
  IPCRendererShim_default as default,
  getIPCRenderer,
  installIPCRendererShim
};
//# sourceMappingURL=IPCRendererShim.js.map
