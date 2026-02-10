/**
 * @module Configuration/ESBuild/Config/CompileConfig
 * @description
 * ESBuild configuration for the Compile build.
 * Extends target config with compilation-specific settings.
 * @category Config
 */
import type { BuildOptions } from "esbuild";

import TargetConfig from "./TargetConfig.js";

const Merge = (await import("deepmerge-ts")).deepmergeCustom({
	mergeArrays: false,
});

/**
 * Compile ESBuild configuration
 */
export default async (Current: BuildOptions): Promise<BuildOptions> =>
	Merge<BuildOptions>(
		await TargetConfig(Current),
		{
			bundle: true,
			outbase: "Target",
			tsconfig: "Configuration/tsconfig/Target/Compile.json",
			plugins: [],
			allowOverwrite: true,
		} as any,
	);
