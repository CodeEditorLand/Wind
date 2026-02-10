/**
 * @module Configuration/ESBuild/Constant/EnvironmentConstant
 * @description
 * Environment detection constants for ESBuild configuration.
 * Checks process environment variables to determine build mode.
 * @category Constant
 */

export const On =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

export const Clean = process.env["Clean"] === "true";

export const Bundle = process.env["Bundle"] === "true";

export const Compile = process.env["Compile"] === "true";
