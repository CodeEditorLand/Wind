/*
 * File: Wind/Source/Application/Log/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:33 UTC
 * Dependency: effect, vs/platform/log/common/log.js
 */

import { Context } from "effect";
import type { ILogService } from "vs/platform/log/common/log.js";

const LogServiceTag = Context.GenericTag<ILogService, ILogService>(
	"vscode/LogService",
);

export default LogServiceTag;
