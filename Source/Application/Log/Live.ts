/*
 * File: Wind/Source/Application/Log/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:33 UTC
 * Dependency: ./Tag.js, effect, vs/platform/log/common/log.js
 */

import { Layer } from "effect";
import { NullLogService } from "vs/platform/log/common/log.js";

import ServiceTag from "./Tag.js";

const LiveLogService: Layer.Layer<import("./Tag.js").Interface, never, never> =
	Layer.succeed(ServiceTag, new NullLogService());

export default LiveLogService;
