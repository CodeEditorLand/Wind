import type { IExtensionService } from "@codeeditorland/output/vs/workbench/services/extensions/common/extensions.js";
import { Effect } from "effect";

export class ExtensionService extends Effect.Service<IExtensionService>()(
	"extensionService",
	{
		sync: () =>
			({
				whenInstalledExtensionsRegistered: () => Promise.resolve(),
			}) as any,
	},
) {}
