/*
 * File: Wind/Source/Application/QuickInput/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:28 UTC
 * Dependency: effect, vs/platform/quickinput/common/quickInput.js
 * Export: Interface
 */

import { Context } from "effect";
import type { IQuickInputService } from "vs/platform/quickinput/common/quickInput.js";

export type Interface = IQuickInputService;

const QuickInputServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/QuickInputService",
);

export default QuickInputServiceTag;
