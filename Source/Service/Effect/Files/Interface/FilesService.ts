import type { FilesProblem } from "../Type/FilesProblem.js";

/**
 * Files service interface
 * Microsoft VSCode Reference: IFileService from vs/platform/files/common/files.ts
 */
export interface FilesService {
	readonly ReadFile: (uri: string) => Promise<Uint8Array>;

	readonly WriteFile: (
		uri: string,

		content: Uint8Array,
	) => Promise<void>;

	readonly Stat: (uri: string) => Promise<{
		readonly type: number;

		readonly size: number;

		readonly mtime: number;
	}>;

	readonly ReadDir: (uri: string) => Promise<readonly [string, number][]>;

	readonly CreateDirectory: (uri: string) => Promise<void>;

	readonly Delete: (
		uri: string,

		options?: { readonly recursive?: boolean },
	) => Promise<void>;

	readonly Rename: (
		source: string,

		target: string,

		options?: { readonly overwrite?: boolean },
	) => Promise<void>;

	readonly Copy: (
		source: string,

		target: string,

		options?: { readonly overwrite?: boolean },
	) => Promise<void>;

	readonly Exists: (uri: string) => Promise<boolean>;

	readonly Watch: (uri: string) => Promise<{ readonly dispose: () => void }>;

	/** Show a native file-open dialog. Returns selected URIs or empty array. */
	readonly ShowOpenDialog: (options?: {
		readonly title?: string;

		readonly filters?: ReadonlyArray<{
			readonly name: string;

			readonly extensions: ReadonlyArray<string>;
		}>;

		readonly canSelectMany?: boolean;

		readonly canSelectFolders?: boolean;
	}) => Promise<readonly string[]>;

	/** Show a native file-save dialog. Returns selected URI or undefined. */
	readonly ShowSaveDialog: (options?: {
		readonly title?: string;

		readonly defaultUri?: string;

		readonly filters?: ReadonlyArray<{
			readonly name: string;

			readonly extensions: ReadonlyArray<string>;
		}>;
	}) => Promise<string | undefined>;
}
