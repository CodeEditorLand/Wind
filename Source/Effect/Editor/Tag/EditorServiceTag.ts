import { Context } from "effect";

import type { EditorService } from "../Interface/EditorService.js";

export class EditorServiceTag extends Context.Tag("Application/EditorService")<
	EditorServiceTag,
	EditorService
>() {}

export const Editor = EditorServiceTag;

export default EditorServiceTag;
