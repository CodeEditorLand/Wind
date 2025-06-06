import { Context } from "effect";
import type { IFileService } from "vs/platform/files/common/files.js";

const FileServiceTag = Context.GenericTag<IFileService, IFileService>(
	"vscode/FileService",
);

export default FileServiceTag;
