/**
 * @module Effect/Health/Tag/HealthTag
 * @description
 * Service tag for dependency injection of the Health service.
 * @category Tag
 */

import { Context } from "effect";

import type { HealthService } from "../Interface/HealthService.js";

export class HealthTag extends Context.Tag("Effect/HealthService")<
	HealthTag,

	HealthService
>() {}

export default HealthTag;
