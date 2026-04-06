import {
	ALLOWED_IPC_CHANNELS as c,
	AiEndpoint as i,
	BLOCKED_IPC_CHANNELS as l,
	TelemetryEndpoint as n,
	MarketplaceEndpoint as r,
	UpdateEndpoint as s,
} from "../Constant/NetworkRestrictionsConstant.js";

const a = (o, t) => {
		try {
			const e = new URL(t);
			return !!(
				e.hostname === "localhost" ||
				e.hostname === "127.0.0.1" ||
				e.hostname === "::1" ||
				(o.allowMountain &&
					(e.hostname.includes("localhost") ||
						e.hostname === "127.0.0.1" ||
						e.port !== void 0))
			);
		} catch {
			return !1;
		}
	},
	u = (o, t) => {
		if (o.blockTelemetry) {
			for (const e of n) if (t.includes(e)) return !0;
		}
		if (o.blockedDomains.length > 0) {
			for (const e of o.blockedDomains) if (t.includes(e)) return !0;
		}
		if (
			t.includes("telemetry") ||
			t.includes("telemetryAppender") ||
			t.includes("vortex")
		)
			return !0;
		if (o.blockMarketplace) {
			for (const e of r)
				if (t.includes("marketplace") || t.includes("extensions"))
					return !0;
		}
		if (o.blockExtensionUpdates) {
			for (const e of s)
				if (t.includes("update") || t.includes("vscode-update"))
					return !0;
		}
		for (const e of i)
			if (t.includes("github.com") || t.includes("copilot")) return !0;
		return !1;
	},
	f = (o, t) => {
		if (o.allowedDomains.length === 0) return !1;
		for (const e of o.allowedDomains) if (t.includes(e)) return !0;
		return !1;
	},
	d = (o) => {
		if (!o.startsWith("vscode:")) return !1;
		for (const t of l) if (o.startsWith(t)) return !1;
		for (const t of c) if (o.startsWith(t)) return !0;
		return !1;
	},
	p = { IsInternalURL: a, IsBlockedURL: u, IsAllowedURL: f, IsIPCAllowed: d };
var k = p;
export {
	f as IsAllowedURL,
	u as IsBlockedURL,
	d as IsIPCAllowed,
	a as IsInternalURL,
	k as default,
};
