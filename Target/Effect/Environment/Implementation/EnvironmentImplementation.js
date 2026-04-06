import { Effect as e, Layer as o } from "effect";

import { EnvironmentTag as c } from "../Tag/EnvironmentTag.js";
import {
	DetectLocale as a,
	DetectArchitecture as i,
	GetUserAgent as m,
	DetectPlatform as r,
	DetectTimezone as s,
} from "./EnvironmentHelper.js";

const l = {
		getInfo: e.sync(() => ({
			platform: r(),
			architecture: i(),
			locale: a(),
			timezone: s(),
			userAgent: m(),
			isSecureContext: typeof window < "u" && window.isSecureContext,
			language: a().split("-")[0] || "en",
		})),
		getPlatform: e.sync(r),
		getArchitecture: e.sync(i),
		isWindows: e.map(e.sync(r), (t) => t === "win32"),
		isMac: e.map(e.sync(r), (t) => t === "darwin"),
		isLinux: e.map(e.sync(r), (t) => t === "linux"),
		isWeb: e.map(e.sync(r), (t) => t === "web"),
	},
	f = o.effect(c, e.succeed(l)),
	u = (t) => {
		const n = {
			platform: "web",
			architecture: "x64",
			locale: "en-US",
			timezone: "UTC",
			userAgent: "Mock",
			isSecureContext: !0,
			language: "en",
			...t,
		};
		return {
			getInfo: e.sync(() => n),
			getPlatform: e.sync(() => n.platform),
			getArchitecture: e.sync(() => n.architecture),
			isWindows: e.sync(() => n.platform === "win32"),
			isMac: e.sync(() => n.platform === "darwin"),
			isLinux: e.sync(() => n.platform === "linux"),
			isWeb: e.sync(() => n.platform === "web"),
		};
	},
	d = o.effect(c, e.succeed(u()));
var v = f;
export {
	f as EnvironmentLive,
	d as EnvironmentMock,
	v as default,
	u as makeMockEnvironment,
};
