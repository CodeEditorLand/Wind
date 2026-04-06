import { Context } from "effect";

import type { LifecycleService } from "../Interface/LifecycleService.js";

export class LifecycleServiceTag extends Context.Tag(
	"Application/LifecycleService",
)<LifecycleServiceTag, LifecycleService>() {}

export const Lifecycle = LifecycleServiceTag;

export default LifecycleServiceTag;
