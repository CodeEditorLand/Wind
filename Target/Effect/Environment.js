var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Context, Layer } from "effect";
class EnvironmentTag extends Context.Tag("Effect/EnvironmentService")() {
  static {
    __name(this, "EnvironmentTag");
  }
}
const detectPlatform = /* @__PURE__ */ __name(() => {
  if (typeof navigator === "undefined") {
    return "web";
  }
  const platform = navigator.platform?.toLowerCase() || "";
  if (platform.includes("win")) {
    return "win32";
  }
  if (platform.includes("mac")) {
    return "darwin";
  }
  if (platform.includes("linux") || platform.includes("ubuntu")) {
    return "linux";
  }
  return "web";
}, "detectPlatform");
const detectArchitecture = /* @__PURE__ */ __name(() => {
  if (typeof navigator === "undefined") {
    return "web";
  }
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("arm") || userAgent.includes("aarch64")) {
    return "arm64";
  }
  return "x64";
}, "detectArchitecture");
const detectLocale = /* @__PURE__ */ __name(() => {
  if (typeof navigator === "undefined") {
    return "en-US";
  }
  return navigator.language || "en-US";
}, "detectLocale");
const detectTimezone = /* @__PURE__ */ __name(() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}, "detectTimezone");
const getUserAgent = /* @__PURE__ */ __name(() => {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }
  return navigator.userAgent || "Unknown";
}, "getUserAgent");
const makeLiveEnvironment = {
  getInfo: Effect.sync(() => ({
    platform: detectPlatform(),
    architecture: detectArchitecture(),
    locale: detectLocale(),
    timezone: detectTimezone(),
    userAgent: getUserAgent(),
    isSecureContext: typeof window !== "undefined" && window.isSecureContext,
    language: detectLocale().split("-")[0] || "en"
  })),
  getPlatform: Effect.sync(detectPlatform),
  getArchitecture: Effect.sync(detectArchitecture),
  isWindows: Effect.map(Effect.sync(detectPlatform), (p) => p === "win32"),
  isMac: Effect.map(Effect.sync(detectPlatform), (p) => p === "darwin"),
  isLinux: Effect.map(Effect.sync(detectPlatform), (p) => p === "linux"),
  isWeb: Effect.map(Effect.sync(detectPlatform), (p) => p === "web")
};
const EnvironmentLive = Layer.effect(
  EnvironmentTag,
  Effect.succeed(makeLiveEnvironment)
);
const makeMockEnvironment = /* @__PURE__ */ __name((overrides) => {
  const mockInfo = {
    platform: "web",
    architecture: "x64",
    locale: "en-US",
    timezone: "UTC",
    userAgent: "Mock",
    isSecureContext: true,
    language: "en",
    ...overrides
  };
  return {
    getInfo: Effect.sync(() => mockInfo),
    getPlatform: Effect.sync(() => mockInfo.platform),
    getArchitecture: Effect.sync(() => mockInfo.architecture),
    isWindows: Effect.sync(() => mockInfo.platform === "win32"),
    isMac: Effect.sync(() => mockInfo.platform === "darwin"),
    isLinux: Effect.sync(() => mockInfo.platform === "linux"),
    isWeb: Effect.sync(() => mockInfo.platform === "web")
  };
}, "makeMockEnvironment");
const EnvironmentMock = Layer.effect(
  EnvironmentTag,
  Effect.succeed(makeMockEnvironment())
);
export {
  EnvironmentLive,
  EnvironmentMock,
  EnvironmentTag,
  makeMockEnvironment
};
//# sourceMappingURL=Environment.js.map
