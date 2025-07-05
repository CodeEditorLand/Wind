/**
 * @module Database
 * @description
 * This module defines the data structures for identifying storage databases
 * when communicating with the native backend.
 */

import type { StorageScope } from "@codeeditorland/output/vs/platform/storage/common/storage.js";

import type { Uri } from "../../Platform/Vscode/Type.js";

/**
 * Represents the identity of a storage database. This DTO is used to specify
 * which database a storage operation should target.
 */
export interface StorageDatabase {
	/**
	 * The scope of the database (Application, Profile, or Workspace).
	 */
	readonly Scope: StorageScope;
	/**
	 * The unique name or identifier for this database instance.
	 */
	readonly Name: string;
	/**
	 * The optional filesystem path for file-backed storage databases.
	 */
	readonly Path?: Uri;
}
