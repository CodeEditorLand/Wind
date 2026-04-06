import { Context } from "effect";

import type { KeybindingService } from "../Interface/KeybindingService.js";

export class KeybindingServiceTag extends Context.Tag(
	"Application/KeybindingService",
)<KeybindingServiceTag, KeybindingService>() {}

export const Keybinding = KeybindingServiceTag;

export default KeybindingServiceTag;
