export interface WorkbenchDialogConfirmOptions {
	readonly message: string;

	readonly detail?: string;

	readonly primaryButton?: string;

	readonly cancelButton?: string;

	readonly type?: "info" | "question" | "warning" | "error";
}

export interface WorkbenchDialogConfirmResult {
	readonly confirmed: boolean;

	readonly checkboxChecked?: boolean;
}

export interface WorkbenchDialogPickOptions {
	readonly message: string;

	readonly detail?: string;

	readonly choices: ReadonlyArray<string>;

	readonly cancelId?: number;
}

export interface WorkbenchDialogService {
	readonly Confirm: (
		options: WorkbenchDialogConfirmOptions,
	) => Promise<WorkbenchDialogConfirmResult>;

	readonly Pick: (options: WorkbenchDialogPickOptions) => Promise<number>;

	readonly Info: (message: string, detail?: string) => Promise<void>;

	readonly Error: (message: string, detail?: string) => Promise<void>;
}
