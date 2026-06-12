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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { ExtensionsService } from "./Interface/ExtensionsService.js";
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
		GetExtension: async (id) => {
			try {
				const Result = await IPCService.invoke(Channel.ExtensionsGet, [id]);
				return Result === null || Result === undefined
					? undefined
					: Result;
			} catch (error) {
				throw MakeExtensionsProblem(error);
			}
		},

		GetAllExtensions: async () => {
			try {
				const Result = await IPCService.invoke(Channel.ExtensionsGetAll, []);
				return Array.isArray(Result) ? (Result as readonly unknown[]) : [];
			} catch (error) {
				throw MakeExtensionsProblem(error);
			}
		},

		IsActive: async (id) => {
			try {
				const Result = await IPCService.invoke(Channel.ExtensionsIsActive, [id]);
				return Boolean(Result);
			} catch (error) {
				throw MakeExtensionsProblem(error);
			}
		},

		// `extensions:activate` sends an `activationEvent` gRPC
		// notification to Cocoon (`$activateByEvent`) via Mountain.
		// Mountain's handler triggers the extension host activation
		// machinery for the named extension ID.
		Activate: async (id) => {
			try {
				await IPCService.invoke(Channel.ExtensionsActivate, [id]);
			} catch {
				// Fallback: verify the extension exists even if
				// activation fails (e.g. extension host not yet up).
				try {
					await IPCService.invoke(Channel.ExtensionsGet, [id]);
				} catch (error) {
					throw MakeExtensionsProblem(error);
				}
			}
		},

		InstallVsix: async (VsixPath) => {
			try {
				return await IPCService.invoke(Channel.ExtensionsInstall, [VsixPath]);
			} catch (error) {
				throw MakeExtensionsProblem(error);
			}
		},

		Uninstall: async (Identifier) => {
			try {
				const Result = await IPCService.invoke(Channel.ExtensionsUninstall, [Identifier]);
				return Result === true;
			} catch (error) {
				throw MakeExtensionsProblem(error);
			}
		},
	};

	return Service;
}

export const LiveExtensionsService = makeLiveExtensionsService();

export default LiveExtensionsService;
