import { Layer } from "effect";
import { NullLogService } from "vs/platform/log/common/log.js";

import ServiceTag from "./Tag.js";

const LiveLogService: Layer.Layer<import("./Tag.js").Interface, never, never> =
	Layer.succeed(ServiceTag, new NullLogService());

export default LiveLogService;
