// Application/Dialog/_HostServicePlaceholder.ts
import { Layer } from "effect";

// Or Platform/VSCode/Provide.js
import { ProvideHost } from "../../Integration/Tauri.js";

// This is a placeholder. In a real application, you'd import the actual live layer for HostService.
export const HostServiceLivePlaceholder = Layer.succeed(ProvideHost, {
	openWindow: (targets, options) => {
		console.log(
			"[MockHostService] openWindow called with:",

			targets,

			options,
		);

		return Promise.resolve();
	},
});
