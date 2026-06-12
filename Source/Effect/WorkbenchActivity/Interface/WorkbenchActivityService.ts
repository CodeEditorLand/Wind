export interface WorkbenchActivityBadge {
	readonly viewContainerId: string;

	readonly count?: number;

	readonly text?: string;

	readonly priority?: number;
}

export interface WorkbenchActivityService {
	readonly ShowBadge: (badge: WorkbenchActivityBadge) => {
		readonly dispose: () => void;
	};

	readonly Clear: (viewContainerId: string) => void;
}
