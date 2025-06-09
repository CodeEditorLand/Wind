/*
 * File: Wind/Source/Application/File/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:40 UTC
 * Dependency: effect, vs/platform/files/common/files.js
 */

import { Context } from "effect";
import type { IFileService } from "vs/platform/files/common/files.js";

const FileServiceTag = Context.GenericTag<IFileService, IFileService>(
	"vscode/FileService",
);

export default FileServiceTag;
