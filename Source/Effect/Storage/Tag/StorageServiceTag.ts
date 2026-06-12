2|
3|import type { StorageService } from "../Interface/StorageService.js";
4|
5|export class StorageServiceTag extends Context.Tag(
6|	"Application/StorageService",
7|)<StorageServiceTag, StorageService>() {}
8|
9|export const Storage = StorageServiceTag;
10|
11|export default StorageServiceTag;
12|
