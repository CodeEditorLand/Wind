import type { BuildOptions } from "esbuild";
export declare const On: boolean;
export declare const Bundle: boolean;
export declare const Compile: boolean;
export declare const Clean: boolean;
export declare const Target: string;
export declare const Merge: typeof import("deepmerge-ts").deepmerge;
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
declare const _default: (Current: BuildOptions) => Promise<BuildOptions>;
export default _default;
//# sourceMappingURL=Target.Backup.d.ts.map