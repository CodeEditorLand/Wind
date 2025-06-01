// Application/Dialog/Factory/CreateWindowOption.ts
// Purpose: Purely constructs VSCode IOpenWindowOptions.

import { pipe } from "effect";
import type { IPickAndOpenOptions as VsCodePickOptions } from "vs/platform/dialogs/common/dialogs";

// VSCode IOpenWindowOptions
// Corrected import
import type { WindowOpenOption as VsCodeWindowOpenOption } from "../../../Platform/VSCode/Type.js";

export default function Create(
	options: VsCodePickOptions,
): VsCodeWindowOpenOption {
	// Use correct type
	return pipe(
		{
			forceNewWindow: options.forceNewWindow ?? false,

			// Use correct type
		} as VsCodeWindowOpenOption,

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
