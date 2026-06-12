export type StorageProblem =
	| { readonly _tag: "StorageNotAvailable"; readonly reason: string }
	| { readonly _tag: "StorageOperationFailed"; readonly error: Error }
	| { readonly _tag: "StorageKeyNotFound"; readonly key: string };
