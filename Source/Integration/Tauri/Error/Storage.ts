/*
 * File: Wind/Source/Integration/Tauri/Error/Storage.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:13 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("StorageProblem")<{
	readonly cause: unknown;
	readonly operation: "initialize" | "get" | "set" | "remove" | "keys";
}> {
	constructor(props: {
		cause: unknown;
		operation: "initialize" | "get" | "set" | "remove" | "keys";
	}) {
		super(props);
	}
}
