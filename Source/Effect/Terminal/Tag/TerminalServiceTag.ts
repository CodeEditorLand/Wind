import { Context } from "effect";

import type { TerminalService } from "../Interface/TerminalService.js";

export class TerminalServiceTag extends Context.Tag(
	"Application/TerminalService",
)<TerminalServiceTag, TerminalService>() {}

export const Terminal = TerminalServiceTag;

export default TerminalServiceTag;
