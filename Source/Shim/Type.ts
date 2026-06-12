/**
 * @module Wind/Shim/Type
 * @description
 * Core types for the Land Shim system. Shared between Wind, Output, and
 * Cocoon. Gated behind TierShim env var.
 *
 * These types define the contract for the SwallowMap decision engine and
 * the RedirectBus that routes swallowed events to Land services.
 */

/** Shim activation level — read from TierShim env var at build time */
export type ShimLevel = "None" | "Proxy" | "Replace" | "Own" | "Preempt";

/** What to do with an intercepted event */
export type SwallowAction = "SWALLOW" | "PASSTHROUGH" | "MIXED" | "DISCARD";

/** Where to route a swallowed event */
export type RedirectTarget =
	| "Wind"
	| "Cocoon"
	| "Mountain"
	| "Output"
	| "Sky"
	| "None";

/** A single rule in the SwallowMap */
export interface SwallowRule {
	/** Regex or prefix pattern to match against method names */
	pattern: string;

	/** What to do when this pattern matches */
	action: SwallowAction;

	/** Where to redirect swallowed events */
	redirectTo: RedirectTarget;

	/** Optional runtime condition — if present, must return true to swallow */
	condition?: (method: string, params: unknown[]) => boolean;
}

/** The decision produced by the SwallowMap for a given method */
export interface SwallowDecision {
	action: SwallowAction;

	redirectTo: RedirectTarget;
}

/** A handler registered on the RedirectBus */
export interface RedirectHandler {
	/** The pattern this handler accepts */
	pattern: string;

	/** Handle the swallowed event and return a result */
	handle: (method: string, params: unknown[]) => Promise<unknown>;
}

/** Direction of data flow relative to the shim */
export type FlowDirection = "Inbound" | "Outbound";

/** An event passing through the shim */
export interface ShimEvent {
	/** Original method name (e.g., "statusbar:set") */
	method: string;

	/** Parameters array */
	params: unknown[];

	/** Direction: inbound (from Wind to Mountain) or outbound (from Mountain to Wind) */
	direction: FlowDirection;

	/** Timestamp when intercepted */
	timestamp: number;
}
