import { Effect, pipe } from "effect";
import {
	StorageScope,
	StorageTarget,
} from "vs/platform/storage/common/storage.js";
import {
	isRecentFile,
	isRecentFolder,
	toStoreData,
	type IRecent,
} from "vs/platform/workspaces/common/workspaces.js";

import { StorageServiceTag } from "../../Storage.js";
import GetRecentlyOpened from "./GetRecentlyOpened.js";

const RECENTLY_OPENED_KEY = "recently.opened";

const AddRecentlyOpened = (
	RecentList: readonly IRecent[],
): Effect.Effect<void, any> =>
	Effect.gen(function* (_) {
		const StorageService = yield* _(StorageServiceTag);
		const RecentlyOpened = yield* _(GetRecentlyOpened);

		for (const Recent of RecentList) {
			if (isRecentFile(Recent)) {
				RecentlyOpened.files = RecentlyOpened.files.filter(
					(f) => f.fileUri.toString() !== Recent.fileUri.toString(),
				);
				RecentlyOpened.files.unshift(Recent);
			} else if (isRecentFolder(Recent)) {
				RecentlyOpened.workspaces = RecentlyOpened.workspaces.filter(
					(w) =>
						(isRecentFolder(w)
							? w.folderUri.toString()
							: w.workspace.configPath.toString()) !==
						Recent.folderUri.toString(),
				);
				RecentlyOpened.workspaces.unshift(Recent);
			} else {
				RecentlyOpened.workspaces = RecentlyOpened.workspaces.filter(
					(w) =>
						(isRecentFolder(w)
							? w.folderUri.toString()
							: w.workspace.configPath.toString()) !==
						Recent.workspace.configPath.toString(),
				);
				RecentlyOpened.workspaces.unshift(Recent);
			}
		}

		yield* _(
			Effect.sync(() =>
				StorageService.store(
					RECENTLY_OPENED_KEY,
					JSON.stringify(toStoreData(RecentlyOpened)),
					StorageScope.APPLICATION,
					StorageTarget.USER,
				),
			),
		);
	});

export default AddRecentlyOpened;
