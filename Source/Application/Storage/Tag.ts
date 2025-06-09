/*
 * File: Wind/Source/Application/Storage/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:27 UTC
 * Dependency: effect, vs/platform/storage/common/storage
 * Export: Interface
 */

import { Context } from "effect";
import type { IStorageService } from "vs/platform/storage/common/storage";

export type Interface = IStorageService;

const StorageServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/StorageService",
);

export default StorageServiceTag;
