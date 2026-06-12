/**
 * @module Effect/Extensions/ChangeStream
 * @description
 * Merged event subscription for extension lifecycle changes.
 *
 * Mountain emits two disjoint Tauri events after the K2/K3 install /
 * uninstall handlers complete:
 *
 *   - `sky://extensions/installed`   → `{ identifier, version, location }`
 *   - `sky://extensions/uninstalled` → `{ identifier, location }`
 *
 * Consumers (sidebar view, notification toast, error-tracking hook) almost
 * always want the union of both - a single callback tagged with the change
 * kind - rather than subscribing to each raw event. The default export
 * registers both Tauri listeners and delivers the union, typed via the
 * Wind `SkyEvent` registry so wire-string changes are caught at compile
 * time.
 *
 * The Sky sidebar subscribes through
 * `Sky/Source/Workbench/Electron/Extension/Change/Subscriber.ts`; the
 * workbench's `ExtensionEnablementService` refreshes on each delivered
 * change so the sidebar re-renders live without a workbench reload.
 */

import { listen } from "@tauri-apps/api/event";

import SkyEvent from "../../IPC/SkyEvent.js";

export type ExtensionChange =
	| {
			readonly Kind: "Installed";

			readonly Identifier: string;

			readonly Version: string;

			readonly Location: string;
	  }
	| {
			readonly Kind: "Uninstalled";

			readonly Identifier: string;

			readonly Location: string | undefined;
	  };

export class ExtensionChangeSubscriptionError extends Error {
	readonly _tag = "ExtensionChangeSubscriptionError" as const;

	constructor(Channel: string, Cause: unknown) {
		super(`Failed to subscribe to ${Channel}: ${String(Cause)}`, {
			cause: Cause,
		});

		this.name = "ExtensionChangeSubscriptionError";
	}
}

const ReadString = (
	Record: Readonly<Record<string, unknown>>,

	Field: string,
): string => {
	const Value = Record[Field];

	return typeof Value === "string" ? Value : "";
};

const ReadOptionalString = (
	Record: Readonly<Record<string, unknown>>,

	Field: string,
): string | undefined => {
	const Value = Record[Field];

	return typeof Value === "string" ? Value : undefined;
};

const AsPayload = (Value: unknown): Readonly<Record<string, unknown>> | null =>
	Value !== null && typeof Value === "object"
		? (Value as Readonly<Record<string, unknown>>)
		: null;

/**
 * Install + uninstall events merged into a single callback of typed
 * `ExtensionChange` items. Any payload shape mismatch produces an
 * empty string / undefined rather than dropping the event - the
 * receiver's refresh logic can re-fetch `extensions:getAll` to recover
 * authoritative state.
 *
 * Resolves once both Tauri listeners are registered. If either
 * registration fails, any listener already registered is detached and
 * an `ExtensionChangeSubscriptionError` is thrown.
 */
export default async (
	Callback: (Change: ExtensionChange) => void,
): Promise<{ readonly dispose: () => void }> => {
	const Unlisteners: Array<() => void> = [];

	const Detach = (): void => {
		for (const Unlisten of Unlisteners.splice(0)) {
			try {
				Unlisten();
			} catch {}
		}
	};

	const Subscribe = async (
		Channel: string,

		Decode: (Payload: Readonly<Record<string, unknown>>) => ExtensionChange,
	): Promise<void> => {
		try {
			Unlisteners.push(
				await listen<unknown>(Channel, (Event) => {
					const Payload = AsPayload(Event.payload);

					if (Payload === null) {
						return;
					}

					Callback(Decode(Payload));
				}),
			);
		} catch (Cause) {
			throw new ExtensionChangeSubscriptionError(Channel, Cause);
		}
	};

	try {
		await Subscribe(SkyEvent.ExtensionsInstalled, (Payload) => ({
			Kind: "Installed",
			Identifier: ReadString(Payload, "identifier"),
			Version: ReadString(Payload, "version"),
			Location: ReadString(Payload, "location"),
		}));

		await Subscribe(SkyEvent.ExtensionsUninstalled, (Payload) => ({
			Kind: "Uninstalled",
			Identifier: ReadString(Payload, "identifier"),
			Location: ReadOptionalString(Payload, "location"),
		}));
	} catch (Cause) {
		Detach();

		throw Cause;
	}

	return {
		dispose: Detach,
	};
};
