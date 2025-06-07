// Source/Application/Workspaces/Trust/Live.ts
import { Effect, Layer, Ref, PubSub, Stream, Schedule } from "effect";
import {
	ConfigurationServiceTag,
	EnvironmentServiceTag,
	FileServiceTag,
	UriIdentityServiceTag,
	WorkspaceContextServiceTag,
	RemoteAuthorityResolverServiceTag,
	StorageServiceTag,
	WorkspaceTrustEnablementServiceTag,
} from "../../../Platform/VSCode/Provide.js"; // Assuming these exist
import {
	LoadTrustInfo,
	SaveTrustInfo,
	ResolveRemoteAuthority,
} from "../../../Integration/Tauri/WorkspaceTrust.js";
import WorkspaceTrustManagementServiceTag, {
	type Interface as WorkspaceTrustManagement,
} from "./Tag.js";

const LiveWorkspaceTrustManagementService = Layer.scoped(
	WorkspaceTrustManagementServiceTag,
	Effect.gen(function* (_) {
		// 1. Explicit Dependencies: All dependencies are declared upfront.
		const ConfigService = yield* _(ConfigurationServiceTag);
		const EnvService = yield* _(EnvironmentServiceTag);
		const StorageService = yield* _(StorageServiceTag);
		const FileService = yield* _(FileServiceTag);
		const WorkspaceService = yield* _(WorkspaceContextServiceTag);
		const UriIdentityService = yield* _(UriIdentityServiceTag);
		const TrustEnablementService = yield* _(
			WorkspaceTrustEnablementServiceTag,
		);

		// 2. State Management with Ref: All mutable state is in Refs.
		const IsTrustedRef = yield* _(Ref.make(false));
		const TrustStateInfoRef = yield* _(
			Ref.make<IWorkspaceTrustInfo>({ uriTrustInfo: [] }),
		);
		const WorkspaceResolved = yield* _(Effect.promise<void>());
		const TrustInitialized = yield* _(Effect.promise<void>());

		// 3. Eventing with PubSub: Emitters are replaced with Pub/Sub channels.
		const OnDidChangeTrustPubSub = yield* _(PubSub.unbounded<boolean>());
		const OnDidChangeTrustedFoldersPubSub = yield* _(
			PubSub.unbounded<void>(),
		);

		// Helper method to calculate trust (pure logic)
		const calculateWorkspaceTrust = () /* params */
		: Effect.Effect<boolean, TrustProblem> => {
			// ... logic from original `calculateWorkspaceTrust` refactored as a pure Effect ...
			return Effect.succeed(true); // Placeholder
		};

		// The main initialization logic as a declarative Effect.
		const initializeEffect = Effect.gen(function* (_) {
			// Load initial trust info from storage
			const initialTrustInfo = yield* _(LoadTrustInfo);
			yield* _(Ref.set(TrustStateInfoRef, initialTrustInfo));

			// Resolve canonical URIs and remote authorities in parallel
			const [_, remoteAuthority] = yield* _(
				Effect.all(
					[
						// resolveCanonicalUris(), // This would be another Effect
						EnvService.remoteAuthority
							? ResolveRemoteAuthority(EnvService.remoteAuthority)
							: Effect.succeed(undefined),
					],
					{ concurrency: "unbounded" },
				),
			);

			yield* _(WorkspaceResolved.succeed(undefined));

			// Initial trust calculation
			const isTrusted = yield* _(calculateWorkspaceTrust(/*...*/));
			yield* _(Ref.set(IsTrustedRef, isTrusted));
			yield* _(OnDidChangeTrustPubSub.publish(isTrusted));

			yield* _(TrustInitialized.succeed(undefined));
		}).pipe(
			Effect.catchAll((error) =>
				Effect.logError("Workspace Trust initialization failed", error),
			),
		);

		// 4. Lifecycle Management: Run initialization in the background.
		yield* _(Effect.forkDaemon(initializeEffect));

		// Listen to workspace folder changes and re-evaluate trust
		const listenForChangesEffect =
			WorkspaceService.onDidChangeWorkspaceFolders(() =>
				calculateWorkspaceTrust(/*...*/).pipe(
					Effect.flatMap((isTrusted) =>
						Ref.set(IsTrustedRef, isTrusted),
					),
				),
			);

		yield* _(Effect.forkDaemon(listenForChangesEffect));

		// 5. The Service Implementation: Methods return Effect.
		const service: WorkspaceTrustManagement = {
			_serviceBrand: undefined,
			IsTrusted: IsTrustedRef,
			OnDidChangeTrust: Stream.fromPubSub(OnDidChangeTrustPubSub),
			OnDidChangeTrustedFolders: Stream.fromPubSub(
				OnDidChangeTrustedFoldersPubSub,
			),
			WorkspaceResolved: WorkspaceResolved.await,
			WorkspaceTrustInitialized: TrustInitialized.await,

			isWorkspaceTrusted: () => Ref.get(IsTrustedRef),

			setWorkspaceTrust: (trusted: boolean) =>
				Effect.gen(function* (_) {
					yield* _(Ref.set(IsTrustedRef, trusted));
					// ... logic from original `setWorkspaceTrust` to update storage ...
					const currentInfo = yield* _(Ref.get(TrustStateInfoRef));
					yield* _(SaveTrustInfo(currentInfo)); // wrapped IO
					yield* _(OnDidChangeTrustPubSub.publish(trusted));
				}),

			// ... other methods ...
			getUriTrustInfo: (uri) => Effect.succeed({ trusted: true, uri }), // Placeholder
			setUrisTrust: (uris, trusted) => Effect.void, // Placeholder
		};

		return service;
	}),
);

export default LiveWorkspaceTrustManagementService;
