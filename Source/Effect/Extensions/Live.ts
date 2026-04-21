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
 * `WindServiceHandler/Extension.rs` (K2/K3) — the prior no-op stub in
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
import { IPC } from "../IPC.js";
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

export const LiveExtensionsServiceLayer = Layer.effect(
	ExtensionsServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;

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
						Array.isArray(Result)
							? (Result as readonly unknown[])
							: [],
					),
					Effect.mapError(MakeExtensionsProblem),
				),

			IsActive: (id) =>
				IPCService.invoke(Channel.ExtensionsIsActive)([id]).pipe(
					Effect.map((Result) => Boolean(Result)),
					Effect.mapError(MakeExtensionsProblem),
				),

			Activate: (id) =>
				// TODO(Wave 3 follow-up): replace with a `commands:execute`
				// of `workbench.extensions.activate` or a dedicated
				// `extensions:activate` channel so Cocoon's `$activateByEvent`
				// actually fires. Current implementation only verifies the
				// extension exists, which matches the legacy stub behaviour.
				IPCService.invoke(Channel.ExtensionsGet)([id]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeExtensionsProblem),
				),

			InstallVsix: (VsixPath) =>
				IPCService.invoke(Channel.ExtensionsInstall)([VsixPath]).pipe(
					Effect.mapError(MakeExtensionsProblem),
				),

			Uninstall: (Identifier) =>
				IPCService.invoke(Channel.ExtensionsUninstall)([
					Identifier,
				]).pipe(
					Effect.map((Result) => Result === true),
					Effect.mapError(MakeExtensionsProblem),
				),
		};

		return Service;
	}),
);

export default LiveExtensionsServiceLayer;
