/**
 * @module Wind/Shim/FullIndex
 * @description
 * Full barrel export for the Land Shim system including all interceptors.
 *
 * This is the "everything" entry point — it re-exports the core shim
 * (Index.ts) plus the standalone proxy interceptors:
 *   - EventInterceptor — Intercepts DOM events (Layer D)
 *   - NetworkProxy      — Intercepts fetch/XHR (Layer E)
 *   - AsyncProxy        — Intercepts async primitives (Layer F)
 *
 * When TierShim=None, all exports are dead-code-eliminated by esbuild
 * because Gate.IsEnabled is `false` and the call sites are compiled out.
 */

// Core shim (Layer A–C)
export * from "./Index.js";

// Layer D — DOM event interception
export { default as installEventInterceptor } from "./EventInterceptor.js";

// Layer E — Network interception
export { default as installNetworkProxy } from "./NetworkProxy.js";

// Layer F — Async scheduling interception
export { default as installAsyncProxy } from "./AsyncProxy.js";
