import type { BuildOptions } from "esbuild";

export const On = (await import("../Wind.js")).On;

export const Bundle = (await import("../Wind.js")).Bundle;

export const Merge = (await import("deepmerge-ts")).deepmergeCustom({
	mergeArrays: false,
});

/**
 * @module ESBuild
 *
 */
export default async (Current: BuildOptions): Promise<BuildOptions> =>
	Merge<[BuildOptions, BuildOptions]>(
		await (await import("../Target.js")).default(Current),

		{
			bundle: true,

			outbase: "Target",

			tsconfig: "Configuration/tsconfig/Target/Compile.json",

			plugins: [],

			allowOverwrite: true,

			platform: "browser",
		},
	);
