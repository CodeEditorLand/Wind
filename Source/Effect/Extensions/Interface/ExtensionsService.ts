import type { Effect } from "effect";

import type { ExtensionsProblem } from "../Type/ExtensionsProblem.js";

/**
 * Extensions service interface.
 *
 * Microsoft VSCode reference: IExtensionService from
 * vs/workbench/services/extensions/common/extensions.ts. Atom K5 extends the
 * contract with `InstallVsix` / `Uninstall` so Wind's "Install from VSIX…"
 * prompt + Extensions sidebar "Uninstall" button resolve through a typed
 * Effect-TS pipeline instead of hitting the ex-no-op IPC stub.
 */
export interface ExtensionsService {
	readonly GetExtension: (
		id: string,
	) => Effect.Effect<unknown | undefined, ExtensionsProblem>;
	readonly GetAllExtensions: () => Effect.Effect<
		readonly unknown[],
		ExtensionsProblem
	>;
	readonly IsActive: (
		id: string,
	) => Effect.Effect<boolean, ExtensionsProblem>;
	readonly Activate: (id: string) => Effect.Effect<void, ExtensionsProblem>;
	/**
	 * Install a local `.vsix` file. `VsixPath` is accepted as either a plain
	 * path or a `file://` URI - Mountain's handler normalises both.
	 *
	 * Resolves with the `ILocalExtension` envelope Mountain returns (same
	 * shape as `ExtensionsGetInstalled`), so the caller can update the
	 * sidebar immediately without re-fetching.
	 */
	readonly InstallVsix: (
		VsixPath: string,
	) => Effect.Effect<unknown, ExtensionsProblem>;
	/**
	 * Uninstall an installed extension by identifier (e.g. "publisher.name").
	 * Resolves with `true` once Mountain has removed the install directory
	 * and broadcast `sky://extensions/uninstalled`.
	 */
	readonly Uninstall: (
		Identifier: string,
	) => Effect.Effect<boolean, ExtensionsProblem>;
}
