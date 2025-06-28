/**
 * @module Database (Application/Storage)
 * @description Defines the data structures for identifying storage databases.
 */
import type { Uri } from "Source/Platform/VSCode/Type.js";
import type { StorageScope } from "vs/platform/storage/common/storage.js";
/**
 * Represents the identity of a storage database, used to communicate with
 * the backend.
 */
export interface StorageDatabase {
    /** The scope of the database (Application, Profile, or Workspace). */
    readonly Scope: StorageScope;
    /** The unique name/identifier for this database instance. */
    readonly Name: string;
    /** The optional filesystem path for file-backed storage. */
    readonly Path?: Uri;
}
