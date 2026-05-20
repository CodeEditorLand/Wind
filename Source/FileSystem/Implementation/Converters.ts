/**
 * @module FileSystem/Implementation/Converters
 *
 * Pure conversion helpers between VS Code URI/IStat shapes and the
 * raw JSON objects that Mountain returns from `file:stat` / `file:readdir`.
 * Isolated here so unit tests can verify the mapping without the full
 * Effect layer or IPC stack.
 */

import { InvalidPathError } from "../Error/FileSystemProviderError";
import { FileType } from "../Type/FileType";
import { URI } from "../Type/URI";

/** Convert a VS Code URI to an absolute file-system path string. */
export function uriToPath(uri: URI): string {
	const path = uri.fsPath;
	if (!path) {
		throw new InvalidPathError(uri.toString());
	}
	return path;
}

/** Wrap an absolute path as a `file://` URI. */
export function pathToUri(path: string): URI {
	return URI.file(path);
}

/**
 * Convert Mountain's `file:stat` response object to the VS Code `IStat`
 * wire shape `{ type, size, ctime, mtime }`.
 */
export function toIStat(stats: {
	is_file?: boolean;
	is_directory?: boolean;
	size?: number;
	created?: number;
	modified?: number;
	accessed?: number;
}): {
	type: number;
	size: number;
	ctime: number;
	mtime: number;
	permissions?: number;
} {
	let type: FileType;
	if (stats.is_directory) {
		type = FileType.Directory;
	} else if (stats.is_file) {
		type = FileType.File;
	} else {
		type = FileType.Unknown;
	}
	return {
		type,
		size: stats.size ?? 0,
		ctime: stats.created ?? stats.modified ?? Date.now(),
		mtime: stats.modified ?? Date.now(),
	};
}

/**
 * Convert Mountain's `file:readdir` response to the VS Code
 * `[name, FileType][]` tuple array.
 */
export function toDirectoryEntries(
	entries: Array<{ name: string; is_file?: boolean; is_directory?: boolean }>,
): [string, FileType][] {
	return entries.map((entry) => {
		let type: FileType;
		if (entry.is_directory) {
			type = FileType.Directory;
		} else if (entry.is_file) {
			type = FileType.File;
		} else {
			type = FileType.Unknown;
		}
		return [entry.name, type];
	});
}
