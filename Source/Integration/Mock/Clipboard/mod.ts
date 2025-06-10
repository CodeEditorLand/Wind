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
