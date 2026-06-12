/**
 * @module FileSystem/Implementation/FileSystemProviderImplementation
 * @description
 * Implementation of the FileSystemProvider service using Tauri IPC to communicate with Mountain.
 * All methods are plain async and throw typed `FileSystemProviderError` subclasses.
 * @see {@link FileSystem/Interface/FileSystemProviderService} Service interface
 * @category Implementation
 */

import { invoke as TauriInvoke } from "@tauri-apps/api/core";

import { Context, Effect, Layer } from "effect";

import {
	InvalidPathError,
	toFileSystemProviderError,
	UnknownFileSystemError,
} from "../Error/FileSystemProviderError";

import type { FileSystemProviderService } from "../Interface/FileSystemProvider";

import type {
	IFileSystemProvider,
	IFileWriteOptions,
} from "../Type/FileSystemType";

import { FileType } from "../Type/FileType";

import { URI } from "../Type/URI";

// ============================================================================
// Mountain IPC Commands
// ============================================================================

/**
 * Mountain IPC command names for file system operations
 * These must match the commands defined in Element/Mountain/Source/IPC/WindServiceHandlers.rs
 */
const MountainCommands = {

	READ: "file:read",

	WRITE: "file:write",

	STAT: "file:stat",

	DELETE: "file:delete",

	MKDIR: "file:mkdir",

	RMDIR: "file:delete", // Mountain doesn't have rmdir, uses delete

	READDIR: "file:readdir",

	COPY: "file:copy",

	MOVE: "file:move",
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert URI to file system path
 * @param uri - URI to convert
 * @returns File system path string
 */
function uriToPath(uri: URI): string {

	// fsPath is a getter on the real VS Code URI, not a method call.
	const path = uri.fsPath;

	if (!path) {
		throw new InvalidPathError(uri.toString());
	}

	return path;
}

/**
 * Convert Mountain stats to IStat format
 * @param stats - Mountain stats object
 * @returns Formatted IStats
 */
function toIStat(stats: {
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

	// Determine file type
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
 * Convert Mountain directory entries to VSCode format
 * @param entries - Mountain directory entries
 * @returns Array of [name, FileType] tuples
 */
function toDirectoryEntries(
	entries: Array<{
		name: string;

		is_file?: boolean;

		is_directory?: boolean;
	}>,
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

// ============================================================================
// Helper: Create provider with IPC access
// ============================================================================

const createProvider = (
	invoke: (command: string, ...args: unknown[]) => Promise<unknown>,
) => {

	class MountainFileSystemProvider implements IFileSystemProvider {
		async readFile(uri: URI): Promise<Uint8Array> {
			const path = uriToPath(uri);

			try {
				const result = await invoke(MountainCommands.READ, path);

				if (typeof result === "string") {
					// Convert string to Uint8Array
					return new TextEncoder().encode(result);
				}

				if (result instanceof Uint8Array) {
					return result;
				}

				if (Array.isArray(result)) {
					return new Uint8Array(result as number[]);
				}

				throw new UnknownFileSystemError(
					"Unexpected result format from file:read",
				);
			} catch (error) {
				throw toFileSystemProviderError(error, "readFile", path);
			}
		}

		async writeFile(
			uri: URI,

			content: Uint8Array,

			_options?: IFileWriteOptions,
		): Promise<void> {
			const path = uriToPath(uri);

			try {
				// Convert Uint8Array to string for Mountain
				// Note: Mountain's file:write expects a string
				const contentStr = new TextDecoder().decode(content);

				await invoke(MountainCommands.WRITE, path, contentStr);
			} catch (error) {
				throw toFileSystemProviderError(error, "writeFile", path);
			}
		}

		async delete(uri: URI): Promise<void> {
			const path = uriToPath(uri);

			try {
				await invoke(MountainCommands.DELETE, path);
			} catch (error) {
				throw toFileSystemProviderError(error, "delete", path);
			}
		}

		async copy(source: URI, destination: URI): Promise<void> {
			const sourcePath = uriToPath(source);

			const destPath = uriToPath(destination);

			try {
				await invoke(MountainCommands.COPY, sourcePath, destPath);
			} catch (error) {
				throw toFileSystemProviderError(
					error,

					"copy",

					`${sourcePath} -> ${destPath}`,
				);
			}
		}

		async move(source: URI, destination: URI): Promise<void> {
			const sourcePath = uriToPath(source);

			const destPath = uriToPath(destination);

			try {
				await invoke(MountainCommands.MOVE, sourcePath, destPath);
			} catch (error) {
				throw toFileSystemProviderError(
					error,

					"move",

					`${sourcePath} -> ${destPath}`,
				);
			}
		}

		async readdir(uri: URI): Promise<[string, FileType][]> {
			const path = uriToPath(uri);

			try {
				const result = await invoke(MountainCommands.READDIR, path);

				if (!Array.isArray(result)) {
					throw new UnknownFileSystemError(
						"Unexpected result format from file:readdir",
					);
				}

				return toDirectoryEntries(
					result as unknown as Array<{
						name: string;

						is_file?: boolean;

						is_directory?: boolean;
					}>,
				);
			} catch (error) {
				throw toFileSystemProviderError(error, "readdir", path);
			}
		}

		async mkdir(
			uri: URI,

			options: { recursive?: boolean } = {},
		): Promise<void> {
			const path = uriToPath(uri);

			try {
				await invoke(
					MountainCommands.MKDIR,

					path,

					options.recursive ?? true,
				);
			} catch (error) {
				throw toFileSystemProviderError(error, "mkdir", path);
			}
		}

		async rmdir(uri: URI): Promise<void> {
			const path = uriToPath(uri);

			try {
				// Mountain doesn't have a separate rmdir, use delete
				await invoke(MountainCommands.RMDIR, path);
			} catch (error) {
				throw toFileSystemProviderError(error, "rmdir", path);
			}
		}

		async stat(uri: URI): Promise<{
			type: number;

			size: number;

			ctime: number;

			mtime: number;

			permissions?: number;
		}> {
			const path = uriToPath(uri);

			try {
				const result = await invoke(MountainCommands.STAT, path);

				if (!result || typeof result !== "object") {
					throw new UnknownFileSystemError(
						"Unexpected result format from file:stat",
					);
				}

				return toIStat(
					result as {
						is_file?: boolean;

						is_directory?: boolean;

						size?: number;

						created?: number;

						modified?: number;

						accessed?: number;
					},
				);
			} catch (error) {
				throw toFileSystemProviderError(error, "stat", path);
			}
		}

		watch(_uri: URI, _options: unknown): { dispose: () => void } {
			// File watching is not implemented in Mountain yet
			// Return a no-op disposable
			return {
				dispose: () => {
					// No-op for now
				},
			};
		}
	}

	return new MountainFileSystemProvider();
};

// ============================================================================
// Service (plain async)
// ============================================================================

/**
 * Build the FileSystemProvider service. Every method is plain async;
 * failures throw `FileSystemProviderError` subclasses (VS Code name
 * contract preserved by the error classes themselves).
 */
function buildFileSystemService(): FileSystemProviderService {

	// Create the provider with IPC access
	const provider = createProvider((command, ...args) =>
		TauriInvoke("MountainIPCInvoke", {
			method: command,
			params: args.length === 1 ? args[0] : args,
		}),
	);

	return {
		provider: provider as unknown as IFileSystemProvider,

		getProvider: Effect.succeed(provider as unknown as IFileSystemProvider),

		readFile: async (uri: string) => {
			try {
				return await provider.readFile(URI.parse(uri));
			} catch (error) {
				throw toFileSystemProviderError(error, "readFile", uri);
			}
		},

		writeFile: async (uri: string, content: Uint8Array, options = {}) => {
			try {
				await provider.writeFile(URI.parse(uri), content, {
					create: options.create ?? true,
					overwrite: options.overwrite ?? true,
				} as IFileWriteOptions);
			} catch (error) {
				throw toFileSystemProviderError(error, "writeFile", uri);
			}
		},

		delete: async (uri: string) => {
			try {
				await provider.delete(URI.parse(uri));
			} catch (error) {
				throw toFileSystemProviderError(error, "delete", uri);
			}
		},

		copy: async (source: string, destination: string) => {
			try {
				await provider.copy(URI.parse(source), URI.parse(destination));
			} catch (error) {
				throw toFileSystemProviderError(
					error,

					"copy",

					`${source} -> ${destination}`,
				);
			}
		},

		move: async (source: string, destination: string) => {
			try {
				await provider.move(URI.parse(source), URI.parse(destination));
			} catch (error) {
				throw toFileSystemProviderError(
					error,

					"move",

					`${source} -> ${destination}`,
				);
			}
		},

		readdir: async (uri: string) => {
			try {
				const entries = await provider.readdir(URI.parse(uri));

				return entries.map(
					([name, type]) =>
						[name, type as number] as [string, number],
				);
			} catch (error) {
				throw toFileSystemProviderError(error, "readdir", uri);
			}
		},

		mkdir: async (uri: string, options = {}) => {
			try {
				await provider.mkdir(URI.parse(uri), options);
			} catch (error) {
				throw toFileSystemProviderError(error, "mkdir", uri);
			}
		},

		rmdir: async (uri: string) => {
			try {
				await provider.rmdir(URI.parse(uri));
			} catch (error) {
				throw toFileSystemProviderError(error, "rmdir", uri);
			}
		},

		stat: async (uri: string) => {
			try {
				return await provider.stat(URI.parse(uri));
			} catch (error) {
				throw toFileSystemProviderError(error, "stat", uri);
			}
		},
	} satisfies FileSystemProviderService;
}

const FileSystemProvider = buildFileSystemService();

// ============================================================================
// Effect compatibility (WorkbenchIntegrationImplementation only)
// ============================================================================

/**
 * Tag retained solely for `Workbench/Implementation/
 * WorkbenchIntegrationImplementation.ts`, which still resolves the
 * service through Effect context. New consumers import the default
 * export directly.
 */
export const FileSystemProviderTag =
	Context.GenericTag<FileSystemProviderService>("FileSystemProvider");

export const FileSystemProviderLive = Layer.succeed(
	FileSystemProviderTag,

	FileSystemProvider,
);

// ============================================================================
// Exports
// ============================================================================

export { MountainCommands };

export default FileSystemProvider;
