/**
 * @module Effect/WorkbenchStorage/Implementation/WorkbenchStorageBridgeShape
 * @description
 * Local TypeScript shape of the `IStorageService` handle exposed on
 * `globalThis.__CEL_SERVICES__.Storage`. Mirrors VS Code's runtime
 * surface (the methods we actually consume). Pinned in its own file
 * so Live + Bridge / future Bridge variants share the same imports.
 * @category Implementation
 */

export interface WorkbenchStorageBridgeShape {
	readonly get: (
		key: string,

		scope: number,

		fallbackValue?: string,
	) => string | undefined;

	readonly getBoolean: (
		key: string,

		scope: number,

		fallbackValue?: boolean,
	) => boolean | undefined;

	readonly getNumber: (
		key: string,

		scope: number,

		fallbackValue?: number,
	) => number | undefined;

	readonly getObject: <T>(
		key: string,

		scope: number,

		fallbackValue?: T,
	) => T | undefined;

	readonly store: (
		key: string,

		value: string | number | boolean | object | null | undefined,

		scope: number,

		target: number,
	) => void;

	readonly remove: (key: string, scope: number) => void;

	readonly keys: (scope: number, target: number) => readonly string[];

	readonly onDidChangeValue: (
		scope: number,

		key: string | undefined,

		disposables: { add: (d: { dispose: () => void }) => void } | undefined,

		listener: (event: {
			readonly key: string;
			readonly scope: number;
			readonly target?: number;
		}) => void,
	) => { readonly dispose: () => void };
}

export interface WorkbenchStorageGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Storage?: WorkbenchStorageBridgeShape | null;
	};

	__CEL_OVERRIDE_STORAGE__?: Record<string, string | undefined>;
}
