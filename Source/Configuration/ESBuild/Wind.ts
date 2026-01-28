/**
 * ESBuild configuration for Wind
 * Builds preload script and bootstrap for VSCode Tauri integration
 */

import * as esbuild from "esbuild";

export const On =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

export const Clean = process.env["Clean"] === "true";

export const Bundle = process.env["Bundle"] === "true";

export const Compile = process.env["Compile"] === "true";

const contextOptions: esbuild.BuildOptions = {
	color: true,
	format: "esm",
	logLevel: On ? "debug" : "info",
	metafile: !On, // Only generate metafile in production
	minify: !On,
	sourcemap: On,
	target: "esnext",
	tsconfig: "tsconfig.json",
	write: true,
	legalComments: On ? "inline" : "none",
	bundle: Bundle,
	ignoreAnnotations: !On,
	keepNames: On,
	loader: {
		".json": "copy",
		".sh": "copy",
	},
	outbase: "Source",
	external: [],
};

/**
 * Build options for Preload script
 * This runs in Tauri's preload context
 */
export const PreloadConfig: esbuild.BuildOptions = {
	...contextOptions,
	entryPoints: ["Source/Preload.ts"],
	outdir: "Configuration",
	outfile: "Configuration/Preload.js",
	platform: "browser",
	minify: !On && Bundle,
	drop: On ? [] : ["debugger", "console"],
	define: {
		"process.env": JSON.stringify(process.env),
	},
	plugins: [
		{
			name: "CleanOutput",
			setup(build) {
				if (Clean) {
					build.onStart(async () => {
						const fs = await import("node:fs/promises");
						try {
							await fs.rm("Configuration", { recursive: true });
							console.log("[Wind Build] Cleaned Configuration directory");
						} catch (e) {
							// Directory might not exist yet
						}
					});
				}
			},
		},
	],
};

/**
 * Build options for Bootstrap script
 * This loads the VSCode workbench
 */
export const BootstrapConfig: esbuild.BuildOptions = {
	...contextOptions,
	entryPoints: ["Source/Bootstrap.ts"],
	outdir: "Configuration",
	outfile: "Configuration/Bootstrap.js",
	platform: "browser",
	minify: !On && Bundle,
	drop: On ? [] : ["debugger"],
	define: {
		"process.env": JSON.stringify(process.env),
	},
	plugins: [],
};

export default async function build() {
	console.log("[Wind Build] Starting build process...");
	
	const results = await Promise.allSettled([
		esbuild.context(PreloadConfig).then(ctx => ctx.rebuild()),
		Compile ? esbuild.context(BootstrapConfig).then(ctx => ctx.rebuild()) : Promise.resolve(),
	]);
	
	results.forEach((result, index) => {
		const name = index === 0 ? "Preload" : "Bootstrap";
		if (result.status === "fulfilled") {
			console.log(`[Wind Build]  ${name} build successful`);
		} else {
			console.error(`[Wind Build]  ${name} build failed:`, result.reason);
		}
	});
	
	console.log("[Wind Build] Build process completed");
}

export const { sep, posix } = await import("node:path");
