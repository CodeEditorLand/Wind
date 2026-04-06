import { Context } from "effect";

import type { CommandsService } from "../Interface/CommandsService.js";

export class CommandsServiceTag extends Context.Tag(
	"Application/CommandsService",
)<CommandsServiceTag, CommandsService>() {}

export const Commands = CommandsServiceTag;

export default CommandsServiceTag;
