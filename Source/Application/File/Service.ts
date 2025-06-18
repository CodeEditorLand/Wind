/*
 * File: Wind/Source/Application/File/Service.ts
 * Responsibility: Defines the TypeScript interface and Effect Context tag for the VS Code File service (IFileService) to enable dependency injection of file system operations within the Cocoon sidecar.
 * Modified: 2025-06-09 15:50:41 UTC
 * Dependency: effect, vs/platform/files/common/files.js
 * Export: Interface, Tag
 */

/**
 * @module Service (File)
 * @description Defines the interface and Context.Tag for the File service.
 */

import { Context } from "effect";
import type { IFileService } from "vs/platform/files/common/files.js";

/**
 * The service interface for the File service.
 * This is an alias for VS Code's `IFileService`.
 */
export type Interface = IFileService;

/**
 * The Context.Tag for the File service.
 */
export const Tag = Context.Tag<Interface>("vscode/FileService");
