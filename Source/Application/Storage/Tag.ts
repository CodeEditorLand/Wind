import { Context } from "effect";
import type { IStorageService } from "vs/platform/storage/common/storage";

export type Interface = IStorageService;

const StorageServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/StorageService",
);

export default StorageServiceTag;
