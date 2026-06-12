/**
 * @module Effect/Extensions/Live
 * @description
 * Live implementation of ExtensionsService backed by Mountain's
 * ExtensionManagementService via Tauri IPC.
 *
 * Atom L3 reference site: every `invoke` sources its wire string from the
 * Channel registry (`Element/Wind/Source/IPC/Channel.ts` / mirror of
 * `Element/Common/Source/IPC/Channel.rs`) rather than from a free-text
 * string literal. A typo now fails to compile instead of hitting the
 * unknown-command fallback in `WindServiceHandlers.rs`.
 *
 * Atom K5: `InstallVsix` / `Uninstall` resolve through real handlers in
 * `WindServiceHandler/Extension.rs` (K2/K3) - the prior no-op stub in
 * `WindServiceHandlers.rs:692-695` silently returned `null`. Callers now
 * observe the ILocalExtension envelope on install and a `true` on uninstall.
 *
 * IPC channels consumed:
 *   ExtensionsGet       → handle_extensions_get
 *   ExtensionsGetAll    → handle_extensions_get_all
 *   ExtensionsIsActive  → handle_extensions_is_active
 *   ExtensionsInstall   → handle_extensions_install (K2)
 *   ExtensionsUninstall → handle_extensions_uninstall (K3)
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { ExtensionsService } from "./Interface/ExtensionsService.js";
import { ExtensionsServiceTag } from "./Tag/ExtensionsServiceTag.js";
import type { ExtensionsProblem } from "./Type/ExtensionsProblem.js";

const MakeExtensionsProblem = (error: unknown): ExtensionsProblem =>
	error instanceof Error
		? { _tag: "ExtensionsOperationFailed", error }
		: {
				_tag: "ExtensionsOperationFailed",

				error: new Error(String(error)),
			};

function makeLiveExtensionsService(): ExtensionsService {
	const IPCService = TauriIPCLive;

	const Service: ExtensionsService = {
		GetExtension: (id) =>
			IPCService.invoke(Channel.ExtensionsGet)([id]).pipe(
				Effect.map((Result) =>
					Result === null || Result === undefined
						? undefined
						: Result,
				),

				Effect.mapError(MakeExtensionsProblem),
			),

		GetAllExtensions: () =>
			IPCService.invoke(Channel.ExtensionsGetAll)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result) ? (Result as readonly unknown[]) : [],
				),

				Effect.mapError(MakeExtensionsProblem),
			),

		IsActive: (id) =>
			IPCService.invoke(Channel.ExtensionsIsActive)([id]).pipe(
				Effect.map((Result) => Boolean(Result)),

				Effect.mapError(MakeExtensionsProblem),
			),

		// `extensions:activate` sends an `activationEvent` gRPC
		// notification to Cocoon (`$activateByEvent`) via Mountain.
		// Mountain's handler triggers the extension host activation
		// machinery for the named extension ID.
		Activate: (id) =>
			IPCService.invoke(Channel.ExtensionsActivate)([id]).pipe(
				Effect.map(() => undefined as void),

				Effect.catchAll(() =>
					// Fallback: verify the extension exists even if
					// activation fails (e.g. extension host not yet up).
					IPCService.invoke(Channel.ExtensionsGet)([id]).pipe(
						Effect.map(() => undefined as void),

						Effect.mapError(MakeExtensionsProblem),
					),
				),

				Effect.mapError(MakeExtensionsProblem),
			),

		InstallVsix: (VsixPath) =>
			IPCService.invoke(Channel.ExtensionsInstall)([VsixPath]).pipe(
				Effect.mapError(MakeExtensionsProblem),
			),

		Uninstall: (Identifier) =>
			IPCService.invoke(Channel.ExtensionsUninstall)([Identifier]).pipe(
				Effect.map((Result) => Result === true),

				Effect.mapError(MakeExtensionsProblem),
			),
	};

	return Service;
}

export const LiveExtensionsServiceLayer = Layer.succeed(
	ExtensionsServiceTag,

	makeLiveExtensionsService(),
);

export default LiveExtensionsServiceLayer;
