import type { Effect } from "effect";
import type { FilesProblem } from "../Type/FilesProblem.js";

/**
 * Files service interface
 * Microsoft VSCode Reference: IFileService from vs/platform/files/common/files.ts
 */
export interface FilesService {
	readonly ReadFile: (uri: string) => Effect.Effect<Uint8Array, FilesProblem>;
	readonly WriteFile: (uri: string, content: Uint8Array) => Effect.Effect<void, FilesProblem>;
	readonly Stat: (uri: string) => Effect.Effect<{ readonly type: number; readonly size: number; readonly mtime: number }, FilesProblem>;
	readonly ReadDir: (uri: string) => Effect.Effect<readonly [string, number][], FilesProblem>;
	readonly CreateDirectory: (uri: string) => Effect.Effect<void, FilesProblem>;
	readonly Delete: (uri: string, options?: { readonly recursive?: boolean }) => Effect.Effect<void, FilesProblem>;
	readonly Rename: (source: string, target: string, options?: { readonly overwrite?: boolean }) => Effect.Effect<void, FilesProblem>;
	readonly Copy: (source: string, target: string, options?: { readonly overwrite?: boolean }) => Effect.Effect<void, FilesProblem>;
	readonly Exists: (uri: string) => Effect.Effect<boolean, FilesProblem>;
	readonly Watch: (uri: string) => Effect.Effect<{ readonly dispose: () => void }, FilesProblem>;
}
