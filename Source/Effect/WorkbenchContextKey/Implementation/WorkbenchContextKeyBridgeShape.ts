export interface WorkbenchContextKeyBridgeShape {
	readonly getContextKeyValue: <T>(key: string) => T | undefined;

	readonly createKey: <T>(
		key: string,

		defaultValue: T | undefined,
	) => { readonly set: (value: T) => void; readonly reset: () => void };

	readonly contextMatchesRules: (
		rules:
			| {
					readonly evaluate: (context: unknown) => boolean;
			  }
			| string,
	) => boolean;

	readonly onDidChangeContext: (
		listener: (event: {
			readonly affectsSome: (keys: Set<string>) => boolean;
			readonly keys?: ReadonlySet<string>;
		}) => void,
	) => { readonly dispose: () => void };
}

export interface WorkbenchContextKeyGlobals {
	readonly __CEL_SERVICES__?: {
		readonly ContextKey?: WorkbenchContextKeyBridgeShape | null;
	};
}
