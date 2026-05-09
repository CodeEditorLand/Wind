import { Effect } from "effect";

import type { StorageService } from "../Interface/StorageService.js";

export const StubStorageService: StorageService = {
	Get: (_key) => Effect.succeed(undefined),

	Set: (_key, _value) => Effect.void,

	Delete: (_key) => Effect.void,

	Keys: () => Effect.succeed([]),
};

export default StubStorageService;
