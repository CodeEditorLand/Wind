var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../node_modules/.pnpm/@tauri-apps+api@2.10.1/node_modules/@tauri-apps/api/external/tslib/tslib.es6.js
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
__name(__classPrivateFieldGet, "__classPrivateFieldGet");
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
__name(__classPrivateFieldSet, "__classPrivateFieldSet");
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// ../../node_modules/.pnpm/@tauri-apps+api@2.10.1/node_modules/@tauri-apps/api/core.js
var _Channel_onmessage, _Channel_nextMessageIndex, _Channel_pendingMessages, _Channel_messageEndIndex, _Resource_rid;
var SERIALIZE_TO_IPC_FN = "__TAURI_TO_IPC_KEY__";
function transformCallback(callback, once2 = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once2);
}
__name(transformCallback, "transformCallback");
var Channel = class {
  static {
    __name(this, "Channel");
  }
  constructor(onmessage) {
    _Channel_onmessage.set(this, void 0);
    _Channel_nextMessageIndex.set(this, 0);
    _Channel_pendingMessages.set(this, []);
    _Channel_messageEndIndex.set(this, void 0);
    __classPrivateFieldSet(this, _Channel_onmessage, onmessage || (() => {
    }), "f");
    this.id = transformCallback((rawMessage) => {
      const index = rawMessage.index;
      if ("end" in rawMessage) {
        if (index == __classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")) {
          this.cleanupCallback();
        } else {
          __classPrivateFieldSet(this, _Channel_messageEndIndex, index, "f");
        }
        return;
      }
      const message = rawMessage.message;
      if (index == __classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")) {
        __classPrivateFieldGet(this, _Channel_onmessage, "f").call(this, message);
        __classPrivateFieldSet(this, _Channel_nextMessageIndex, __classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") + 1, "f");
        while (__classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") in __classPrivateFieldGet(this, _Channel_pendingMessages, "f")) {
          const message2 = __classPrivateFieldGet(this, _Channel_pendingMessages, "f")[__classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")];
          __classPrivateFieldGet(this, _Channel_onmessage, "f").call(this, message2);
          delete __classPrivateFieldGet(this, _Channel_pendingMessages, "f")[__classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")];
          __classPrivateFieldSet(this, _Channel_nextMessageIndex, __classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") + 1, "f");
        }
        if (__classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") === __classPrivateFieldGet(this, _Channel_messageEndIndex, "f")) {
          this.cleanupCallback();
        }
      } else {
        __classPrivateFieldGet(this, _Channel_pendingMessages, "f")[index] = message;
      }
    });
  }
  cleanupCallback() {
    window.__TAURI_INTERNALS__.unregisterCallback(this.id);
  }
  set onmessage(handler) {
    __classPrivateFieldSet(this, _Channel_onmessage, handler, "f");
  }
  get onmessage() {
    return __classPrivateFieldGet(this, _Channel_onmessage, "f");
  }
  [(_Channel_onmessage = /* @__PURE__ */ new WeakMap(), _Channel_nextMessageIndex = /* @__PURE__ */ new WeakMap(), _Channel_pendingMessages = /* @__PURE__ */ new WeakMap(), _Channel_messageEndIndex = /* @__PURE__ */ new WeakMap(), SERIALIZE_TO_IPC_FN)]() {
    return `__CHANNEL__:${this.id}`;
  }
  toJSON() {
    return this[SERIALIZE_TO_IPC_FN]();
  }
};
var PluginListener = class {
  static {
    __name(this, "PluginListener");
  }
  constructor(plugin, event, channelId) {
    this.plugin = plugin;
    this.event = event;
    this.channelId = channelId;
  }
  async unregister() {
    return invoke(`plugin:${this.plugin}|remove_listener`, {
      event: this.event,
      channelId: this.channelId
    });
  }
};
async function addPluginListener(plugin, event, cb) {
  const handler = new Channel(cb);
  try {
    await invoke(`plugin:${plugin}|register_listener`, {
      event,
      handler
    });
    return new PluginListener(plugin, event, handler.id);
  } catch {
    await invoke(`plugin:${plugin}|registerListener`, { event, handler });
    return new PluginListener(plugin, event, handler.id);
  }
}
__name(addPluginListener, "addPluginListener");
async function checkPermissions(plugin) {
  return invoke(`plugin:${plugin}|check_permissions`);
}
__name(checkPermissions, "checkPermissions");
async function requestPermissions(plugin) {
  return invoke(`plugin:${plugin}|request_permissions`);
}
__name(requestPermissions, "requestPermissions");
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
__name(invoke, "invoke");
function convertFileSrc(filePath, protocol = "asset") {
  return window.__TAURI_INTERNALS__.convertFileSrc(filePath, protocol);
}
__name(convertFileSrc, "convertFileSrc");
var Resource = class {
  static {
    __name(this, "Resource");
  }
  get rid() {
    return __classPrivateFieldGet(this, _Resource_rid, "f");
  }
  constructor(rid) {
    _Resource_rid.set(this, void 0);
    __classPrivateFieldSet(this, _Resource_rid, rid, "f");
  }
  /**
   * Destroys and cleans up this resource from memory.
   * **You should not call any method on this object anymore and should drop any reference to it.**
   */
  async close() {
    return invoke("plugin:resources|close", {
      rid: this.rid
    });
  }
};
_Resource_rid = /* @__PURE__ */ new WeakMap();
function isTauri() {
  return !!(globalThis || window).isTauri;
}
__name(isTauri, "isTauri");

// ../../node_modules/.pnpm/@tauri-apps+api@2.10.1/node_modules/@tauri-apps/api/event.js
var TauriEvent;
(function(TauriEvent2) {
  TauriEvent2["WINDOW_RESIZED"] = "tauri://resize";
  TauriEvent2["WINDOW_MOVED"] = "tauri://move";
  TauriEvent2["WINDOW_CLOSE_REQUESTED"] = "tauri://close-requested";
  TauriEvent2["WINDOW_DESTROYED"] = "tauri://destroyed";
  TauriEvent2["WINDOW_FOCUS"] = "tauri://focus";
  TauriEvent2["WINDOW_BLUR"] = "tauri://blur";
  TauriEvent2["WINDOW_SCALE_FACTOR_CHANGED"] = "tauri://scale-change";
  TauriEvent2["WINDOW_THEME_CHANGED"] = "tauri://theme-changed";
  TauriEvent2["WINDOW_CREATED"] = "tauri://window-created";
  TauriEvent2["WEBVIEW_CREATED"] = "tauri://webview-created";
  TauriEvent2["DRAG_ENTER"] = "tauri://drag-enter";
  TauriEvent2["DRAG_OVER"] = "tauri://drag-over";
  TauriEvent2["DRAG_DROP"] = "tauri://drag-drop";
  TauriEvent2["DRAG_LEAVE"] = "tauri://drag-leave";
})(TauriEvent || (TauriEvent = {}));
async function _unlisten(event, eventId) {
  window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener(event, eventId);
  await invoke("plugin:event|unlisten", {
    event,
    eventId
  });
}
__name(_unlisten, "_unlisten");
async function listen(event, handler, options) {
  var _a;
  const target = typeof (options === null || options === void 0 ? void 0 : options.target) === "string" ? { kind: "AnyLabel", label: options.target } : (_a = options === null || options === void 0 ? void 0 : options.target) !== null && _a !== void 0 ? _a : { kind: "Any" };
  return invoke("plugin:event|listen", {
    event,
    target,
    handler: transformCallback(handler)
  }).then((eventId) => {
    return async () => _unlisten(event, eventId);
  });
}
__name(listen, "listen");
async function once(event, handler, options) {
  return listen(event, (eventData) => {
    void _unlisten(event, eventData.id);
    handler(eventData);
  }, options);
}
__name(once, "once");
async function emit(event, payload) {
  await invoke("plugin:event|emit", {
    event,
    payload
  });
}
__name(emit, "emit");
async function emitTo(target, event, payload) {
  const eventTarget = typeof target === "string" ? { kind: "AnyLabel", label: target } : target;
  await invoke("plugin:event|emit_to", {
    target: eventTarget,
    event,
    payload
  });
}
__name(emitTo, "emitTo");

// Source/Preload.ts
var cleanupMap = /* @__PURE__ */ new Map();
var isTauri2 = typeof window !== "undefined" && window.__TAURI__ !== void 0;
var ipcRenderer = {
  send: /* @__PURE__ */ __name((channel, ...args) => {
    emit(channel, args.length === 1 ? args[0] : args);
  }, "send"),
  invoke: /* @__PURE__ */ __name(async (channel, ...args) => {
    const invokeArgs = args.length === 0 ? void 0 : args.length === 1 ? args[0] : args;
    return invoke(channel, invokeArgs);
  }, "invoke"),
  on: /* @__PURE__ */ __name((channel, listener) => {
    listen(channel, (event) => {
      listener(event, event.payload);
    }).then((unlisten) => {
      const cleanup = /* @__PURE__ */ __name(() => unlisten(), "cleanup");
      cleanupMap.set(channel, cleanup);
    });
  }, "on"),
  once: /* @__PURE__ */ __name((channel, listener) => {
    const wrappedListener = /* @__PURE__ */ __name((event) => {
      listener(event, event.payload || event);
    }, "wrappedListener");
    listen(channel, wrappedListener).then((unlisten) => {
      setTimeout(() => unlisten(), 0);
    });
  }, "once"),
  removeListener: /* @__PURE__ */ __name((channel, _listener) => {
    const cleanup = cleanupMap.get(channel);
    if (cleanup) {
      cleanup();
      cleanupMap.delete(channel);
    }
  }, "removeListener"),
  removeAllListeners: /* @__PURE__ */ __name((channel) => {
    const cleanup = cleanupMap.get(channel);
    if (cleanup) {
      cleanup();
      cleanupMap.delete(channel);
    }
  }, "removeAllListeners")
};
var ipcMessagePort = {
  acquire: /* @__PURE__ */ __name((responseChannel, nonce) => {
    console.log(
      `[Preload] MessagePort acquire requested: ${responseChannel}, ${nonce}`
    );
    setTimeout(() => {
      ipcRenderer.send(responseChannel, nonce);
    }, 0);
  }, "acquire")
};
var webFrame = {
  setZoomLevel: /* @__PURE__ */ __name((level) => {
    document.documentElement.style.setProperty(
      "--zoom-level",
      String(level)
    );
    console.log(`[Preload] Zoom level set to: ${level}`);
  }, "setZoomLevel")
};
var process = {
  platform: (navigator.platform || "unknown").toLowerCase().includes("win") ? "win32" : (navigator.platform || "unknown").toLowerCase().includes("mac") ? "darwin" : "linux",
  arch: "x64",
  // TODO: Detect from Tauri
  env: {},
  versions: {
    node: "20.0.0",
    // Placeholder
    chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "unknown",
    electron: "30.0.0"
    // Placeholder for compatibility
  },
  cwd: /* @__PURE__ */ __name(() => "/app", "cwd"),
  shellEnv: /* @__PURE__ */ __name(async () => ({}), "shellEnv"),
  getProcessMemoryInfo: /* @__PURE__ */ __name(async () => ({
    workingSetSize: 0,
    peakWorkingSetSize: 0,
    privateBytes: 0,
    sharedBytes: 0
  }), "getProcessMemoryInfo"),
  on: /* @__PURE__ */ __name((_type, _callback) => {
  }, "on")
};
var cachedConfiguration = null;
var context = {
  configuration: /* @__PURE__ */ __name(async () => {
    if (cachedConfiguration) return cachedConfiguration;
    try {
      const config = await invoke("mountain_get_workbench_configuration");
      cachedConfiguration = config;
      return config;
    } catch (error) {
      console.error("[Preload] Failed to fetch configuration:", error);
      throw error;
    }
  }, "configuration"),
  resolveConfiguration: /* @__PURE__ */ __name(async () => {
    return context.configuration();
  }, "resolveConfiguration")
};
var webUtils = {
  getPathForFile: /* @__PURE__ */ __name((file) => {
    return `file://${file.name}`;
  }, "getPathForFile")
};
var globals = {
  ipcRenderer,
  ipcMessagePort,
  webFrame,
  process,
  context,
  webUtils
};
if (isTauri2) {
  window.vscode = globals;
  console.log("[Preload] \u2705 Sandbox globals exposed to window.vscode");
  window.dispatchEvent(new Event("vscode-wind-preload-ready"));
} else {
  console.error("[Preload] \u274C Tauri not detected - preload failed");
}
//# sourceMappingURL=Preload.js.map
