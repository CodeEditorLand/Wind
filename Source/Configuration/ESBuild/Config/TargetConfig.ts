/**
 * @module Configuration/ESBuild/Config/TargetConfig
 * @description
 * ESBuild configuration for the Target build.
 * Extends base config with target-specific settings.
 * @category Config
 */
import { deepmerge } from "deepmerge-ts";
import type { BuildOptions } from "esbuild";

import * as Environment from "../Constant/EnvironmentConstant.js";
import BaseConfig from "./BaseConfig.js";

/**
 * Target ESBuild configuration
 */
export default async function targetConfig(
	Current: BuildOptions,
): Promise<BuildOptions> {
	const merged = deepmerge(BaseConfig, {
		outdir: "Target",
		drop: Environment.On ? [] : ["debugger", "console"],
		define: {
			__DEV__: Environment.On ? "true" : "false",
			__INCREMENT__: `"${`${Environment.On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`,
		},
		treeShaking: !Environment.On,
		entryPoints: (
			await import("@playform/build/Target/Function/Entry.js")
		).default(Current, ["Source/Configuration/*"]),
		platform: "browser",
		outbase: "Source",
		plugins: Environment.Compile
			? deepmerge(Current.plugins || [], [
					{
						name: "Compile",
						setup({ onEnd }: any) {
							onEnd(async ({ metafile }: any) => {
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
												await import("@playform/build/Target/Function/Exec.js")
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
				])
			: [],
	});

	return merged as unknown as BuildOptions;
}
