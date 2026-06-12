/**
 * @module Wind/Shim
 * @description
 * Barrel export for the Land Shim system.
 *
 * The shim intercepts Tauri IPC calls before they reach Mountain's
 * DispatchMatch. When TierShim is active, events matching SwallowMap
 * rules are routed to Land's service tree instead of flowing through
 * VS Code's event waterfall.
 *
 * Architecture:
 *   Gate.ts — Reads TierShim env var, exports boolean flags
 *   SwallowMap.ts — Pattern-matching decision engine
 *   RedirectBus.ts — Routes swallowed events to Land handlers
 *   IPCInterceptor.ts — Wraps Tauri invoke() to intercept calls
 *   AuditLog.ts — Records service resolution for Proxy mode
 */

export { type ShimLevel } from "./Type.js";

export type {
	SwallowRule,
	SwallowDecision,
	RedirectHandler,
	ShimEvent,
	SwallowAction,
	RedirectTarget,
	FlowDirection,
} from "./Type.js";

export {
	IsEnabled,
	IsProxy,
	IsReplace,
	IsOwn,
	IsPreempt,
	CurrentLevel,
} from "./Gate.js";

export { SwallowMap } from "./SwallowMap.js";

export { RedirectBus } from "./RedirectBus.js";

export { Intercept, createInterceptedInvoke } from "./IPCInterceptor.js";

export { AuditLog } from "./AuditLog.js";

export type { AuditEntry } from "./AuditLog.js";
