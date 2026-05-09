import { Context } from "effect";

import type { StorageService } from "../Interface/StorageService.js";

export class StorageServiceTag extends Context.Tag(
	"Application/StorageService",
)<StorageServiceTag, StorageService>() {}

export const Storage = StorageServiceTag;

export default StorageServiceTag;
