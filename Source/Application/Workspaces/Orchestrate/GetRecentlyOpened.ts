import { Effect } from "effect";
import { StorageScope } from "vs/platform/storage/common/storage.js";
import { restoreRecentlyOpened } from "vs/platform/workspaces/common/workspaces.js";

import { LogServiceTag } from "../../Log.js";
import { StorageServiceTag } from "../../Storage.js";

const RECENTLY_OPENED_KEY = "recently.opened";

const GetRecentlyOpened = Effect.gen(function* (_) {
	const StorageService = yield* _(StorageServiceTag);
	const LogService = yield* _(LogServiceTag);

	const RecentlyOpenedRaw = StorageService.get(
		RECENTLY_OPENED_KEY,
		StorageScope.APPLICATION,
	);

	if (RecentlyOpenedRaw) {
		const StoredRecents = JSON.parse(RecentlyOpenedRaw);
		return restoreRecentlyOpened(StoredRecents, LogService);
	}

	return { workspaces: [], files: [] };
});

export default GetRecentlyOpened;
