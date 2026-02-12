/*
 * File: Wind/Source/Configuration/ESBuild/Target/Compile.ts
 * Responsibility: Configures ESBuild options for the Compile target by merging base settings from the Target module with Compile-specific properties (bundle mode, output base, TypeScript config) to define the build process for the Land project.
 * Modified: 2025-06-09 00:59:16 UTC
 * Dependency: esbuild
 * Export: Bundle, Merge, On
 */

import type { BuildOptions } from "esbuild";

// Import from the main Wind module (dynamic)
export const On = (await import("../Wind.js")).On;
export const Bundle = (await import("../Wind.js")).Bundle;

// Import custom merge function
export const Merge = (await import("deepmerge-ts")).deepmergeCustom({
	mergeArrays: false,
});

/**
 * @module ESBuild
 *
 */
export default async (Current: BuildOptions): Promise<BuildOptions> => {
	// Import the Target config (which is an async function)
	const TargetConfigModule = await import("../Target.js");
	const TargetResult = await TargetConfigModule.default(Current);

	// Merge with compile-specific settings
	return Merge(TargetResult, {
		bundle: true,
		outbase: "Target",
		tsconfig: "Configuration/tsconfig/Target/Compile.json",
		plugins: [],
		allowOverwrite: true,
	}) as BuildOptions;
};
