// Application/Dialog/Factory/CreateWindowOptions.ts
// Purpose: Purely constructs VSCode IOpenWindowOptions.

import { pipe } from "effect";
import type { IPickAndOpenOptions as VsCodePickOptions } from "vs/platform/dialogs/common/dialogs";

import type { WindowOption } from "../../../Platform/VSCode/Types.js"; // VSCode IOpenWindowOptions

/**
 * @module CreateWindowOptions
 * @description Purely constructs VSCode IOpenWindowOptions from IPickAndOpenOptions.
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
			options.remoteAuthority !== undefined
				? { ...current, remoteAuthority: options.remoteAuthority }
				: current,
	);
}
