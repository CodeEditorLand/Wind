/*
 * File: Wind/Source/Application/Lifecycle/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:33 UTC
 * Dependency: effect, vs/workbench/services/lifecycle/common/lifecycle.js
 * Export: Interface
 */

import { Context } from "effect";
import type { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle.js";

export type Interface = ILifecycleService;

const LifecycleServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/LifecycleService",
);

export default LifecycleServiceTag;
