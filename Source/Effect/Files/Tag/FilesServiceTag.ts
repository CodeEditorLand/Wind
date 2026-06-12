import { Context } from "effect";

import type { FilesService } from "../Interface/FilesService.js";

export class FilesServiceTag extends Context.Tag("Application/FilesService")<
	FilesServiceTag,

	FilesService
>() {}

export const Files = FilesServiceTag;

export default FilesServiceTag;
