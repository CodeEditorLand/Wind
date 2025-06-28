var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { generateUuid } from "vs/base/common/uuid.js";
class APICommand {
  constructor(Id, InternalId) {
    this.Id = Id;
    this.InternalId = InternalId;
  }
  static {
    __name(this, "APICommand");
  }
}
class CommandConverter {
  constructor(RegisterCommand, ExecuteCommand, LookupAPICommand) {
    this.RegisterCommand = RegisterCommand;
    this.ExecuteCommand = ExecuteCommand;
    this.LookupAPICommand = LookupAPICommand;
    this.DelegatingCommandId = `_wind.delegate.${generateUuid()}`;
    this.RegisterCommand(
      false,
      // Delegated commands are internal, not global.
      this.DelegatingCommandId,
      this.ExecuteDelegatedCommand.bind(this),
      this
    );
  }
  static {
    __name(this, "CommandConverter");
  }
  DelegatingCommandId;
  DelegatedCommands = /* @__PURE__ */ new Map();
  ExecuteDelegatedCommand(Id, ...ArgumentArray) {
    const Command = this.DelegatedCommands.get(Id);
    if (!Command) {
      throw new Error(`Unknown delegated command: ${Id}`);
    }
    return this.ExecuteCommand(
      Command.command,
      ...Command.arguments ?? [],
      ...ArgumentArray
    );
  }
  ToInternal(Command, DisposableArray) {
    if (!Command) {
      return void 0;
    }
    const APICommandValue = this.LookupAPICommand(Command.command);
    if (APICommandValue) {
      return {
        id: APICommandValue.InternalId,
        title: Command.title,
        arguments: Command.arguments
      };
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
  FromInternal(CommandDTO) {
    if (!CommandDTO) {
      return void 0;
    }
    const Result = {
      command: CommandDTO.id,
      title: CommandDTO.title
    };
    if (CommandDTO.tooltip) {
      Result.tooltip = CommandDTO.tooltip;
    }
    if (CommandDTO.arguments) {
      Result.arguments = CommandDTO.arguments;
    }
    return Result;
  }
}
export {
  APICommand,
  CommandConverter
};
//# sourceMappingURL=Command.js.map
