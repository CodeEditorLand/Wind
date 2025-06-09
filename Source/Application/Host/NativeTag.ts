/*
 * File: Wind/Source/Application/Host/NativeTag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:38 UTC
 * Dependency: effect, vs/platform/native/common/native.js
 * Export: Interface
 */

import { Context } from "effect";
import type { INativeHostService } from "vs/platform/native/common/native.js";

export type Interface = INativeHostService;

const NativeHostServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/NativeHostService",
);

export default NativeHostServiceTag;
