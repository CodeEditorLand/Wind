// Source/Integration/Tauri/WorkspaceTrust.ts
import { Context, Effect } from "effect";
import { URI } from "vs/base/common/uri.js";
import { IRemoteAuthorityResolverService } from "vs/platform/remote/common/remoteAuthorityResolver.js";
import {
	IStorageService,
	StorageScope,
	StorageTarget,
} from "vs/platform/storage/common/storage.js";

import {
	RemoteResolverProblem,
	StorageProblem,
} from "../../Application/Workspaces/Trust/Error/TrustProblem.js";

// Define Tags for the dependencies we need from VS Code's DI world.
const StorageServiceTag = Context.Tag<IStorageService>("vscode/StorageService");
const RemoteAuthorityResolverServiceTag =
	Context.Tag<IRemoteAuthorityResolverService>(
		"vscode/RemoteAuthorityResolverService",
	);

const WORKSPACE_TRUST_STORAGE_KEY = "content.trust.model.key";

// An Effect to load the trust info from storage.
export const LoadTrustInfo = Effect.gen(function* (_) {
	const StorageService = yield* _(StorageServiceTag);
	const InfoAsString = yield* _(
		Effect.try(() =>
			StorageService.get(
				WORKSPACE_TRUST_STORAGE_KEY,
				StorageScope.APPLICATION,
			),
		),
	);

	// ... parsing and reviving logic from the original file ...
	// For brevity, we'll assume a happy path here.
	const ParsedInfo = JSON.parse(InfoAsString || '{ "uriTrustInfo": [] }');
	ParsedInfo.uriTrustInfo = (ParsedInfo.uriTrustInfo ?? []).map(
		(info: any) => ({ uri: URI.revive(info.uri), trusted: info.trusted }),
	);

	return ParsedInfo;
}).pipe(
	Effect.catchAll((cause) =>
		Effect.fail(new StorageProblem({ cause, context: "LoadTrustInfo" })),
	),
);

// An Effect to save the trust info.
export const SaveTrustInfo = (Info: IWorkspaceTrustInfo) =>
	Effect.gen(function* (_) {
		const StorageService = yield* _(StorageServiceTag);
		const InfoAsString = JSON.stringify(Info);

		yield* _(
			Effect.tryPromise(() =>
				StorageService.store(
					WORKSPACE_TRUST_STORAGE_KEY,
					InfoAsString,
					StorageScope.APPLICATION,
					StorageTarget.MACHINE,
				),
			),
		);
	}).pipe(
		Effect.catchAll((cause) =>
			Effect.fail(
				new StorageProblem({ cause, context: "SaveTrustInfo" }),
			),
		),
	);

// An Effect to resolve a remote authority.
export const ResolveRemoteAuthority = (Authority: string) =>
	Effect.gen(function* (_) {
		const RemoteResolver = yield* _(RemoteAuthorityResolverServiceTag);
		return yield* _(
			Effect.tryPromise({
				try: () => RemoteResolver.resolveAuthority(Authority),
				catch: (cause) =>
					new RemoteResolverProblem({
						cause,
						context: "ResolveAuthority",
					}),
			}),
		);
	});
