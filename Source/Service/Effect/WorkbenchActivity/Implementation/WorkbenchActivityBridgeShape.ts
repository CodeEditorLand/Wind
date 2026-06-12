export interface UpstreamWorkbenchBadge {
	readonly number?: number;

	readonly text?: string;

	readonly getDescription: () => string;
}

export interface WorkbenchActivityBridgeShape {
	readonly showViewContainerActivity: (
		viewContainerId: string,

		activity: {
			readonly badge: UpstreamWorkbenchBadge;

			readonly priority?: number;
		},
	) => { readonly dispose: () => void };

	readonly showViewActivity: (
		viewId: string,

		activity: {
			readonly badge: UpstreamWorkbenchBadge;

			readonly priority?: number;
		},
	) => { readonly dispose: () => void };

	readonly showAccountsActivity: (activity: {
		readonly badge: UpstreamWorkbenchBadge;

		readonly priority?: number;
	}) => { readonly dispose: () => void };

	readonly showGlobalActivity: (activity: {
		readonly badge: UpstreamWorkbenchBadge;

		readonly priority?: number;
	}) => { readonly dispose: () => void };
}

export interface WorkbenchActivityGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Activity?: WorkbenchActivityBridgeShape | null;
	};
}
