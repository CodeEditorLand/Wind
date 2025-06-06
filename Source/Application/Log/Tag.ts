import { Context } from "effect";
import type { ILogService } from "vs/platform/log/common/log.js";

const LogServiceTag = Context.GenericTag<ILogService, ILogService>(
	"vscode/LogService",
);

export default LogServiceTag;
