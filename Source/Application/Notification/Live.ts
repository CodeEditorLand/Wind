/*
 * File: Wind/Source/Application/Notification/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:31 UTC
 * Dependency: ./Definition.js, ./Tag.js, effect
 */

import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag, { type Interface as ServiceInterface } from "./Tag.js";

const LiveNotificationService: Layer.Layer<ServiceInterface, never, never> =
	Layer.effect(ServiceTag, Definition);

export default LiveNotificationService;
