/*
 * File: Wind/Source/Application/Host/Type/HostProblem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:37 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("HostProblem")<{
	readonly cause: unknown;
	readonly operation: "createWebviewWindow";
}> {
	constructor(props: { cause: unknown; operation: "createWebviewWindow" }) {
		super(props);
	}
}
