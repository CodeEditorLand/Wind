export interface WorkbenchCommandBridgeShape {
	readonly executeCommand: <T = unknown>(
		commandId: string,
		...args: ReadonlyArray<unknown>
	) => Promise<T | undefined>;
	readonly onWillExecuteCommand: (
		listener: (event: {
			readonly commandId: string;
			readonly args: ReadonlyArray<unknown>;
		}) => void,
	) => { readonly dispose: () => void };
	readonly onDidExecuteCommand: (
		listener: (event: {
			readonly commandId: string;
			readonly args: ReadonlyArray<unknown>;
		}) => void,
	) => { readonly dispose: () => void };
}

export interface WorkbenchCommandRegistryShape {
	readonly getCommands: () => Map<string, unknown>;
	readonly getCommand: (id: string) => unknown | undefined;
}

export interface WorkbenchCommandGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Commands?: WorkbenchCommandBridgeShape | null;
		readonly CommandRegistry?: WorkbenchCommandRegistryShape | null;
	};
}
