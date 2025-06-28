var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { generateUuid } from "vs/base/common/uuid.js";
import {} from "./Service.js";
class CommandImplementation {
  constructor(CommandService) {
    this.CommandService = CommandService;
    this.DelegatingCommandId = `_wind.delegate.${generateUuid()}`;
    this.CommandService.registerCommand(
      false,
      // Delegated commands are not global.
      this.DelegatingCommandId,
      this.ExecuteDelegatedCommand.bind(this),
      this
    );
  }
  static {
    __name(this, "CommandImplementation");
  }
  DelegatingCommandId;
  DelegatedCommands = /* @__PURE__ */ new Map();
  ExecuteDelegatedCommand(Id, ...ArgumentArray) {
    const Command = this.DelegatedCommands.get(Id);
    if (!Command) {
      throw new Error(`Unknown delegated command: ${Id}`);
    }
    return this.CommandService.executeCommand(
      Command.command,
      ...Command.arguments ?? [],
      ...ArgumentArray
    );
  }
  ToInternal(Command, DisposableArray) {
    if (!Command) {
      return void 0;
    }
    if (Array.isArray(Command.arguments) && Command.arguments.some((Argument) => typeof Argument === "function")) {
      const Id = generateUuid();
      this.DelegatedCommands.set(Id, Command);
      DisposableArray.push({
        dispose: /* @__PURE__ */ __name(() => this.DelegatedCommands.delete(Id), "dispose")
      });
      return {
        id: this.DelegatingCommandId,
        title: Command.title,
        arguments: [Id, ...Command.arguments ?? []]
      };
    }
    const Result = {
      id: Command.command,
      title: Command.title
    };
    if (Command.tooltip) {
      Result.tooltip = Command.tooltip;
    }
    if (Command.arguments) {
      Result.arguments = Command.arguments;
    }
    return Result;
  }
}
export {
  CommandImplementation
};
//# sourceMappingURL=Implementation.js.map
