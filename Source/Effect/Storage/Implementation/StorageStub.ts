import type { StorageService } from "../Interface/StorageService.js";

export const StubStorageService: StorageService = {
	Get: (_key) => undefined,

	Set: (_key, _value) => {},

	Delete: (_key) => {},

	Keys: () => [],
};

export default StubStorageService;
