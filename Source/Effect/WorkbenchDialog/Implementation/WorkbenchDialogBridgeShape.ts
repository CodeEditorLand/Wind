export interface WorkbenchDialogBridgeShape {
	readonly confirm: (confirmation: {
		readonly message: string;
		readonly detail?: string;
		readonly primaryButton?: string;
		readonly cancelButton?: string;
		readonly type?: string;
	}) => Promise<{ confirmed: boolean; checkboxChecked?: boolean }>;
	readonly prompt: (prompt: {
		readonly message: string;
		readonly detail?: string;
		readonly buttons: ReadonlyArray<{ label: string; run?: unknown }>;
		readonly cancelButton?: { label: string; run?: unknown };
		readonly type?: string;
	}) => Promise<{ readonly result: unknown }>;
	readonly info: (message: string, detail?: string) => Promise<unknown>;
	readonly warn: (message: string, detail?: string) => Promise<unknown>;
	readonly error: (message: string, detail?: string) => Promise<unknown>;
}

export interface WorkbenchDialogGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Dialog?: WorkbenchDialogBridgeShape | null;
	};
}
