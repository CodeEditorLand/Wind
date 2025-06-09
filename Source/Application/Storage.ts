/*
 * File: Wind/Source/Application/Storage.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:27 UTC
 * Export: default, type Interface
 */

export { default as LiveStorageService } from "./Storage/Live.js";
export {
	default as StorageServiceTag,
	type Interface as Storage,
} from "./Storage/Tag.js";
