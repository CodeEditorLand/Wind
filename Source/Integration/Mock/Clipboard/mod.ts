/*
 * File: Wind/Source/Integration/Mock/Clipboard/mod.ts
 * Responsibility: Implements Tauri command handlers for clipboard operations (text, resources, and images) to enable the Sky frontend to interact with the system clipboard via the Mountain backend.
 * Modified: 2025-06-09 15:50:37 UTC
 * Dependency: ./Wrap/HasResourceList.js, ./Wrap/ReadImage.js, ./Wrap/ReadResourceList.js, ./Wrap/ReadText.js, ./Wrap/WriteResourceList.js, ./Wrap/WriteText.js
 * Export: MockClipboard
 */

/**
 * @module Clipboard (Mock Integration)
 * @description Provides a mock implementation of the Clipboard integration service.
 */

import { MockHasResourceList } from "./Wrap/HasResourceList.js";
import { MockReadImage } from "./Wrap/ReadImage.js";
import { MockReadResourceList } from "./Wrap/ReadResourceList.js";
import { MockReadText } from "./Wrap/ReadText.js";
import { MockWriteResourceList } from "./Wrap/WriteResourceList.js";
import { MockWriteText } from "./Wrap/WriteText.js";

/**
 * An object containing mock implementations for all clipboard-related integration effects.
 */
export const MockClipboard = {
	ReadText: MockReadText,
	WriteText: MockWriteText,
	ReadResourceList: MockReadResourceList,
	WriteResourceList: MockWriteResourceList,
	HasResourceList: MockHasResourceList,
	ReadImage: MockReadImage,
};
