/*
 * File: Wind/Source/Configuration/ESBuild/Target.ts
 * Responsibility: Configures the esbuild bundler for the Land project's build system (Maintain), setting output to 'Target', conditionally removing debug code, defining build constants, and optionally adding a compilation plugin to process JavaScript outputs for the Sky frontend.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: esbuild
 * Export: Bundle, Compile, Merge, On
 */

import type { BuildOptions } from "esbuild";

export const On = (await import("./Wind.js")).On;

export const Bundle = (await import("./Wind.js")).Bundle;

export const Compile = (await import("./Wind.js")).Compile;

export const Merge = (await import("deepmerge-ts")).deepmerge;

/**
 * @module ESBuild
 *
 */
export default async (Current: BuildOptions): Promise<BuildOptions> =>
	Merge<[BuildOptions, BuildOptions]>(
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

			plugins: Compile
				? Merge<[BuildOptions["plugins"], BuildOptions["plugins"]]>(
						Current.plugins,

						[
							{
								name: "Compile",

								setup({ onEnd }) {
									onEnd(async ({ metafile }) => {
										const _Output = metafile?.outputs;

										for (const Output in _Output) {
											if (
												Object.prototype.hasOwnProperty.call(
													_Output,

													Output,
												)
											) {
												if (Output.endsWith(".js")) {
													(
														await import(
															"@playform/build/Target/Function/Exec.js"
														)
													).default(
														`Build '${Output}' \
													--ESBuild Configuration/ESBuild/Target/Compile.js \
													--TypeScript Configuration/tsconfig/Target/Compile.json`,
													);
												}
											}
										}
									});
								},
							},
						],
					)
				: [],
		},
	);
