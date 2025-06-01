// Application/Dialog/Factory/CreateWindowOption.ts
// Purpose: Purely constructs VSCode IOpenWindowOptions.

import { pipe } from "effect";
import type { IPickAndOpenOptions as VsCodePickOptions } from "vs/platform/dialogs/common/dialogs";

// VSCode IOpenWindowOptions
import type { WindowOption } from "../../../Platform/VSCode/Type.js";

/**
 * @module CreateWindowOption (Factory)
 * @description Purely constructs VSCode WindowOpenOption from IPickAndOpenOptions.
 */
export default function Create(options: VsCodePickOptions): WindowOption {
	return pipe(
		{ forceNewWindow: options.forceNewWindow ?? false } as WindowOption,

		(current) =>
			typeof (options as any).forceReuseWindow === "boolean"
				? {
						...current,

						forceReuseWindow: (options as any).forceReuseWindow,
					}
				: current,

		(current) =>
			// Check if remoteAuthority is explicitly provided
			options.remoteAuthority !== undefined
				? { ...current, remoteAuthority: options.remoteAuthority }
				: current,
	);
}
