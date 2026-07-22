/**
 * @module Wind/Shim/NetworkProxy
 * @description
 * Intercepts global fetch() and XMLHttpRequest to route network calls
 * through Land's service tree instead of letting them flow directly to
 * external endpoints.
 *
 * Interception targets:
 *   - vscode-file:// URIs → routed through Mountain's scheme handler
 *   - Microsoft telemetry endpoints → silently discarded (204)
 *   - Extension gallery queries (marketplace.visualstudio.com / open-vsx.org)
 *     → routed to Land's gallery service
 *   - Everything else → passthrough to original fetch/XHR
 *
 * Gated behind TierShim — when TierShim=None, esbuild dead-code-eliminates
 * this entire module.
 */

import { IsEnabled } from "./Gate.js";

// ──────────────────────────────────────
// Telemetry blackhole — endpoints to discard
// ──────────────────────────────────────

const TelemetryPatterns: readonly string[] = [
	"dc.services.visualstudio.com",

	"vortex.data.microsoft.com",
];

function isTelemetryEndpoint(url: string): boolean {

	return TelemetryPatterns.some((p) => url.includes(p));
}

// ──────────────────────────────────────
// Gallery patterns — extension marketplace
// ──────────────────────────────────────

const GalleryPatterns: readonly string[] = [
	"marketplace.visualstudio.com",

	"open-vsx.org",
];

function isGalleryEndpoint(url: string): boolean {

	return GalleryPatterns.some((p) => url.includes(p));
}

// ──────────────────────────────────────
// URL extraction helpers
// ──────────────────────────────────────

function extractUrl(input: RequestInfo | URL): string {

	if (typeof input === "string") return input;

	if (input instanceof URL) return input.href;

	return input.url;
}

// ──────────────────────────────────────
// vscode-file:// handler
// ──────────────────────────────────────

async function handleVscodeFileRequest(
	url: string,

	_init?: RequestInit,
): Promise<Response> {

	// Route vscode-file:// through Mountain's scheme handler.
	// In Land's architecture, this means redirecting to the IPC layer
	// which will resolve the virtual file system resource.
	try {
		// Placeholder: in production, this goes through Mountain IPC.
		// For now, return a 501 indicating the handler exists but the
		// underlying service needs wiring.
		return new Response(null, {
			status: 501,
			statusText:
				"Not Implemented — vscode-file:// handler pending Mountain wire-up",
		});
	} catch {
		return new Response(null, { status: 500 });
	}
}

// ──────────────────────────────────────
// Gallery request handler
// ──────────────────────────────────────

async function handleGalleryRequest(
	url: string,

	_init?: RequestInit,
): Promise<Response> {

	// Route extension gallery queries to Land's gallery service.
	// This prevents direct calls to Microsoft/OpenVSX and instead
	// goes through Land's curated extension registry.
	try {
		// Placeholder: in production, this calls Land's GalleryService.
		return new Response(null, {
			status: 501,
			statusText:
				"Not Implemented — gallery handler pending Land GalleryService wire-up",
		});
	} catch {
		return new Response(null, { status: 500 });
	}
}

// ──────────────────────────────────────
// XMLHttpRequest interception
// ──────────────────────────────────────

function installXHRInterceptor(): void {

	const OriginalXHR = globalThis.XMLHttpRequest;

	const OriginalOpen = OriginalXHR.prototype.open;

	const OriginalSend = OriginalXHR.prototype.send;

	OriginalXHR.prototype.open = function (
		method: string,

		url: string | URL,

		async?: boolean,

		username?: string | null,

		password?: string | null,
	): void {
		// Store the resolved URL for later use in send()
		(this as unknown as Record<string, unknown>).__land_url = extractUrl(
			typeof url === "string" ? url : url,
		);

		return OriginalOpen.call(
			this,

			method,

			url,

			async ?? true,

			username ?? null,

			password ?? null,
		);
	};

	OriginalXHR.prototype.send = function (
		body?: Document | XMLHttpRequestBodyInit | null,
	): void {
		const storedUrl = (this as unknown as Record<string, unknown>)
			.__land_url as string | undefined;

		const url = storedUrl ?? "";

		// Discard telemetry
		if (isTelemetryEndpoint(url)) {
			// Abort silently — the caller gets an aborted XHR
			this.abort();

			return;
		}

		return OriginalSend.call(this, body);
	};
}

// ──────────────────────────────────────
// fetch() interception
// ──────────────────────────────────────

function installFetchInterceptor(): void {

	const originalFetch: typeof globalThis.fetch =
		globalThis.fetch.bind(globalThis);

	globalThis.fetch = function (
		input: RequestInfo | URL,

		init?: RequestInit,
	): Promise<Response> {
		const url = extractUrl(input);

		// Discard Microsoft telemetry silently
		if (isTelemetryEndpoint(url)) {
			return Promise.resolve(new Response(null, { status: 204 }));
		}

		// Route vscode-file:// through Mountain scheme handler
		if (url.startsWith("vscode-file://")) {
			return handleVscodeFileRequest(url, init);
		}

		// Route extension gallery queries to Land's gallery
		if (isGalleryEndpoint(url)) {
			return handleGalleryRequest(url, init);
		}

		return originalFetch(input, init);
	} as typeof globalThis.fetch;
}

// ──────────────────────────────────────
// Public API
// ──────────────────────────────────────

/**
 * Install the network proxy layer. Must be called once at startup.
 * When TierShim=None, this is a no-op and esbuild removes the call site.
 */
export default function installNetworkProxy(): void {

	if (!IsEnabled) return;

	installFetchInterceptor();

	installXHRInterceptor();
}
