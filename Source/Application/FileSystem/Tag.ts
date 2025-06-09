/*
 * File: Wind/Source/Application/FileSystem/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:39 UTC
 * Dependency: effect, vs/platform/files/common/files
 * Export: Interface
 */

import { Context } from "effect";
import type { IFileSystemProvider } from "vs/platform/files/common/files";

export type Interface = IFileSystemProvider;

const FileSystemProviderTag = Context.GenericTag<Interface, Interface>(
	"vscode/TauriDiskFileSystemProvider",
);

export default FileSystemProviderTag;
