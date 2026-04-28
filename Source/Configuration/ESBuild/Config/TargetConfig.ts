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
 * PostHog env-var defines for the Wind browser bundle.
 *
 * Wind's `Telemetry/PostHog/Configuration.ts::ReadString` prefers
 * `import.meta.env.<KEY>` over `process.env.<KEY>`; in a browser context
 * there IS no `process.env`, so the import-meta branch is the only one
 * that returns a real value. For esbuild to resolve `import.meta.env.X`
 * at build time, every key consumed has to be listed as a define.
 *
 * Kept in lockstep with `Element/Sky/astro.config.ts` (same key set,
 * same fallback defaults). Sourced from `.env.Land.PostHog` via
 * `Maintain/Script/TierEnvironment.sh`. Absence of a key still yields
 * a valid build: the consumer's fallback matches the default on the
 * right of `??` here.
 */
const PostHogDefines = {
	"import.meta.env.Authorize": JSON.stringify(
		process.env["Authorize"] ?? "",
	),
	"import.meta.env.Beam": JSON.stringify(
		process.env["Beam"] ?? "https://eu.i.posthog.com",
	),
	"import.meta.env.Report": JSON.stringify(
		process.env["Report"] ?? "true",
	),
	"import.meta.env.Replay": JSON.stringify(
		process.env["Replay"] ?? "false",
	),
	"import.meta.env.Ask": JSON.stringify(
		process.env["Ask"] ?? "false",
	),
	"import.meta.env.Brand": JSON.stringify(
		process.env["Brand"] ?? "",
	),
};

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
			...PostHogDefines,
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
