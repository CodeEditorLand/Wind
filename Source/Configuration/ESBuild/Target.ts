import type { BuildOptions, Plugin } from "esbuild";

export const On = (await import("./Wind.js")).On;
export const Bundle = (await import("./Wind.js")).Bundle;
export const Compile = (await import("./Wind.js")).Compile;
export const Clean = (await import("./Wind.js")).Clean;
export const Target = process.env["Target"] || "tauri";

export const Merge = (await import("deepmerge-ts")).deepmerge;

/**
 * Enhanced ESBuild configuration for VSCode Wind with Tauri integration support
 * 
 * Key improvements:
 * - Proper platform targeting for Tauri webview environment
 * - Enhanced module resolution for VSCode dependencies
 * - Comprehensive asset handling and optimization
 * - Development/production build differentiation
 * - Source map generation for debugging
 * - Path mapping for VSCode module resolution
 */
export default async (Current: BuildOptions): Promise<BuildOptions> =>
	Merge<[BuildOptions, BuildOptions]>(
		(await import("./Wind.js")).default,

		{
			color: true,
			
			// ES module format for modern browser compatibility
			format: "esm",
			
			// Enhanced logging for build diagnostics
			logLevel: On ? "debug" : "warning",
			
			// Generate metadata for bundle analysis
			metafile: true,
			
			// Minification optimized for Tauri webview environment
			minify: !On && Bundle,
			
			// Output directory structure optimized for Tauri integration
			outdir: "Target",
			
			// Platform targeting for Tauri webview (browser environment)
			platform: "browser",
			
			// Modern ES target for Tauri compatibility
			target: "es2022",
			
			// TypeScript configuration with enhanced path mapping
			tsconfig: "Source/tsconfig.json",
			
			write: true,
			
			// Legal comments handling optimized for production
			legalComments: On ? "inline" : "none",
			
			// Bundle configuration for Tauri deployment
			bundle: Bundle,
			
			// Asset naming optimized for caching and versioning
			assetNames: Bundle ? "Asset/[name]-[hash]" : "[name]",
			
			// Source map generation for debugging
			sourcemap: On ? "linked" : false,
			
			// Code elimination optimized for Tauri environment
			drop: On ? [] : ["debugger", "console"],
			
			// Enhanced annotation handling
			ignoreAnnotations: !On,
			
			// Name preservation for better debugging
			keepNames: On,
			
			// External dependencies that should not be bundled (Tauri provides these)
			external: [
				"@tauri-apps/api",
				"@tauri-apps/api/core",
				"@tauri-apps/api/event",
				"@codeeditorland/output/vs/*", // VSCode modules are external
			],
			
			// Enhanced plugins for VSCode Wind requirements
			plugins: [
				{
					name: "WindBuildCleaner",
					setup({ onStart }) {
						onStart(async () => {
							if (Clean) {
								try {
									const fs = await import("node:fs/promises");
									const path = await import("node:path");
									
									// Clean target directory
									const targetDir = path.join(process.cwd(), "Target");
									try {
										await fs.rm(targetDir, { recursive: true, force: true });
										console.log(`[ESBuild] Cleaned target directory: ${targetDir}`);
									} catch (error) {
										console.warn(`[ESBuild] Could not clean target directory: ${error}`);
									}
									
									// Clean configuration directory if needed
									const configDir = path.join(process.cwd(), "Configuration");
									if (configDir !== targetDir) {
										try {
											await fs.rm(configDir, { recursive: true, force: true });
											console.log(`[ESBuild] Cleaned config directory: ${configDir}`);
										} catch (error) {
											// Config directory might not exist, which is fine
										}
									}
								} catch (error) {
									console.error("[ESBuild] Clean operation failed:", error);
								}
							}
						});
					},
				} as Plugin,
				{
					name: "WindPathResolver",
					setup({ onResolve }) {
						// Enhanced path resolution for VSCode modules
						onResolve({ filter: /^@codeeditorland\/output\/vs/ }, (args) => {
							const resolvedPath = args.path.replace(
								/^@codeeditorland\/output\/vs/,
								"../Dependency/Microsoft/VSCode/node_modules/@codeeditorland/output/vs"
							);
							return { path: resolvedPath, external: true };
						});
						
						// Path resolution for Tauri modules
						onResolve({ filter: /^@tauri-apps\/api/ }, (args) => {
							return { path: args.path, external: true };
						});
					},
				} as Plugin,
				{
					name: "WindAssetProcessor",
					setup({ onLoad }) {
						// Enhanced asset processing for Tauri deployment
						onLoad({ filter: /\.(json|sh)$/ }, async (args) => {
							try {
								const fs = await import("node:fs/promises");
								const content = await fs.readFile(args.path, "utf8");
								
								if (args.path.endsWith(".json")) {
									return {
										contents: content,
										loader: "json",
									};
								} else if (args.path.endsWith(".sh")) {
									return {
										contents: content,
										loader: "text",
									};
								}
							} catch (error) {
								console.error(`[ESBuild] Failed to load asset: ${args.path}`, error);
								return { contents: "", loader: "text" };
							}
						});
					},
				} as Plugin,
			].concat(Compile ? [
				{
					name: "Compile",
					setup({ onEnd }) {
						onEnd(async ({ metafile }) => {
							const _Output = metafile?.outputs;
							for (const Output in _Output) {
								if (Object.prototype.hasOwnProperty.call(_Output, Output)) {
									if (Output.endsWith(".js")) {
										(await import("@playform/build/Target/Function/Exec.js")).default(
											`Build '${Output}' \
											--ESBuild Configuration/ESBuild/Target/Compile.js \
											--TypeScript Configuration/tsconfig/Target/Compile.json`
										);
									}
								}
							}
						});
					},
				}
			] : []),
			
			// Enhanced loader configuration
			loader: {
				".ts": "ts",
				".tsx": "tsx",
				".js": "js",
				".jsx": "jsx",
				".json": "copy",
				".sh": "copy",
				".css": "css",
				".html": "text",
			},
			
			// Enhanced entry points configuration for Tauri
			entryPoints: Bundle ? [
				"Source/Bridge.ts",
				"Source/Application/DesktopMain.ts",
				"Source/Application/**/*.ts",
			] : [
				"Source/**/*.ts",
			],
			
			// Chunking configuration for optimal Tauri performance
			chunkNames: Bundle ? "chunks/[name]-[hash]" : "[name]",
			
			// Tree shaking optimized for Tauri environment
			treeShaking: true,
			
			// Enhanced define replacements for environment variables
			define: {
				"process.env.NODE_ENV": On ? '"development"' : '"production"',
				"process.env.TAURI_ENV_DEBUG": On ? 'true' : 'false',
				"process.env.TARGET": `"${Target}"`,
				__DEV__: On ? "true" : "false",
				__INCREMENT__: `"${`${On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`,
			},
			
			// Enhanced path mapping for VSCode module resolution
			alias: {
				"@codeeditorland/output/vs": "../Dependency/Microsoft/VSCode/node_modules/@codeeditorland/output/vs",
			},
			
			// Base directory for source files
			outbase: "Source",
		},
	);
