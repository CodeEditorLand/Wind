import { Context } from "effect";
import type { IFileSystemProvider } from "vs/platform/files/common/files";

export type Interface = IFileSystemProvider;

const FileSystemProviderTag = Context.GenericTag<Interface, Interface>(
	"vscode/TauriDiskFileSystemProvider",
);

export default FileSystemProviderTag;
