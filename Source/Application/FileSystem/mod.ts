

/**
 * @module FileSystem (Application)
 * @description This module provides the `IFileSystemProvider` implementation for the
 * local disk, powered by the Tauri backend. This is a low-level provider consumed
 * by the higher-level `FileService`.
 */

import { Problem as FileSystemProviderProblem } from "./Error.js";
import { Live as LiveFileSystemProviderLayer } from "./Live.js";
import {
	Tag as FileSystemProviderTag,
	type Interface as FileSystemProviderInterface,
} from "./Service.js";

/**
 * The Context.Tag for the FileSystemProvider service.
 * @see Service.Interface
 */
export const Tag = FileSystemProviderTag;
export type Interface = FileSystemProviderInterface;

/**
 * The live implementation Layer for the FileSystemProvider service.
 * @see Live
 */
export const Live = LiveFileSystemProviderLayer;

/**
 * The domain-specific error for FileSystemProvider service operations.
 * @see Error.Problem
 */
export const Problem = FileSystemProviderProblem;
export type Problem = FileSystemProviderProblem;
