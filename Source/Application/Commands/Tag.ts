import { Context } from "effect";
import type { ICommandService } from "vs/platform/commands/common/commands.js";

export type Interface = ICommandService;

const CommandServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/CommandService",
);

export default CommandServiceTag;
