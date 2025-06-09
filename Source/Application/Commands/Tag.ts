/*
 * File: Wind/Source/Application/Commands/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:47 UTC
 * Dependency: effect, vs/platform/commands/common/commands.js
 * Export: Interface
 */

import { Context } from "effect";
import type { ICommandService } from "vs/platform/commands/common/commands.js";

export type Interface = ICommandService;

const CommandServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/CommandService",
);

export default CommandServiceTag;
