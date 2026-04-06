import type { Effect } from "effect";

import type { FilesProblem } from "../Type/FilesProblem.js";

/**
 * Files service interface
 * Microsoft VSCode Reference: IFileService from vs/platform/files/common/files.ts
 */
export interface FilesService {
	readonly ReadFile: (uri: string) => Effect.Effect<Uint8Array, FilesProblem>;
	readonly WriteFile: (
		uri: string,
		content: Uint8Array,
	) => Effect.Effect<void, FilesProblem>;
	readonly Stat: (uri: string) => Effect.Effect<
		{
			readonly type: number;
			readonly size: number;
			readonly mtime: number;
		},
		FilesProblem
	>;
	readonly ReadDir: (
		uri: string,
	) => Effect.Effect<readonly [string, number][], FilesProblem>;
	readonly CreateDirectory: (
		uri: string,
	) => Effect.Effect<void, FilesProblem>;
	readonly Delete: (
		uri: string,
		options?: { readonly recursive?: boolean },
	) => Effect.Effect<void, FilesProblem>;
	readonly Rename: (
		source: string,
		target: string,
		options?: { readonly overwrite?: boolean },
	) => Effect.Effect<void, FilesProblem>;
	readonly Copy: (
		source: string,
		target: string,
		options?: { readonly overwrite?: boolean },
	) => Effect.Effect<void, FilesProblem>;
	readonly Exists: (uri: string) => Effect.Effect<boolean, FilesProblem>;
	readonly Watch: (
		uri: string,
	) => Effect.Effect<{ readonly dispose: () => void }, FilesProblem>;
	/** Show a native file-open dialog. Returns selected URIs or empty array. */
	readonly ShowOpenDialog: (options?: {
		readonly title?: string;
		readonly filters?: ReadonlyArray<{
			readonly name: string;
			readonly extensions: ReadonlyArray<string>;
		}>;
		readonly canSelectMany?: boolean;
		readonly canSelectFolders?: boolean;
	}) => Effect.Effect<readonly string[], FilesProblem>;
	/** Show a native file-save dialog. Returns selected URI or undefined. */
	readonly ShowSaveDialog: (options?: {
		readonly title?: string;
		readonly defaultUri?: string;
		readonly filters?: ReadonlyArray<{
			readonly name: string;
			readonly extensions: ReadonlyArray<string>;
		}>;
	}) => Effect.Effect<string | undefined, FilesProblem>;
}
