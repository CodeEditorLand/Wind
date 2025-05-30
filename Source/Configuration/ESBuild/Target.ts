import type { BuildOptions } from "esbuild";

export const On = (await import("./Wind.js")).On;

export const Bundle = (await import("./Wind.js")).Bundle;

/**
 * @module ESBuild
 *
 */
export default async (Current: BuildOptions): Promise<BuildOptions> =>
	(await import("deepmerge-ts")).deepmerge<[BuildOptions, BuildOptions]>(
		(await import("./Wind.js")).default,

		{
			outdir: "Target",

			drop: On ? [] : ["debugger", "console"],

			define: {
				__DEV__: On ? "true" : "false",

				__INCREMENT__: `"${`${On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`,
			},

			treeShaking: true,

			entryPoints: (
				await import("@playform/build/Target/Function/Entry.js")
			).default(Current, ["Source/Configuration/*"]),

			platform: "browser",

			outbase: "Source",

			// external: Bundle
			// 	? [
			// 			"@tauri-apps/api/path",
			// 			"@tauri-apps/plugin-dialog",
			// 			"effect",
			// 			"vs/*",
			// 		]
			// 	: [],
		},
	);
