import { Context } from "effect";
import type { TextFileService } from "../Interface/TextFileService.js";

export class TextFileServiceTag extends Context.Tag(
	"Application/TextFileService",
)<TextFileServiceTag, TextFileService>() {}

export const TextFile = TextFileServiceTag;

export default TextFileServiceTag;
